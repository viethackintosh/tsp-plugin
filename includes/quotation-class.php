<?php
if (! class_exists('Quotation')) {
    class Quotation extends Tsp {
        protected static $instance;	
        
        public $handle = 'quotation';
        public $jsFile = 'assets/script/quotation.js'; // link dẫn đến file javascript dùng để xử lý tại client
        public $cssFile='assets/scss/app.min.css'; // link dẫn đến file css

        public $pageSlug = 'baogia'; // thay thế menu slug             
        public $menuRole = 'manage_woocommerce';

        public static function get_instance(){
            if( is_null( self::$instance ) ){
                self::$instance = new self();
            }
            return self::$instance;
        }
               
        public function adminMenuRegister() { 
            parent::adminMenuRegister();
            add_submenu_page(
                $this->menuSlug,
                '',
                'Quotation',                
                $this->menuRole,
                $this->pageSlug,
                [$this,'pageContent'],
                null
            );
        }
        public function initClass() {
            parent::InitClass();		
            // thêm dòng thêm người vào báo giá ở trang danh sách users
            add_filter('user_row_actions',[$this, 'addUserToQuotation'], 10, 2);
            
            //thêm một button lập báo giá dưới mỗi sản phẩm ngoài trang danh sách sản phẩm
            add_filter( 'post_row_actions',[$this,'addProductToQuotation'], 10, 2 );		

            //thêm một button lập báo giá dưới mỗi sản phẩm trong trang chỉnh sửa sản phẩm
            add_action('woocommerce_product_options_general_product_data',[$this,'addtoQuotationButton'],20);	 
        
            //thêm một button vào mỗi biến thể của sản phẩm
            add_action('woocommerce_product_after_variable_attributes',[$this,'addtoQuotationButtonVariation'],10,3); 	

            //Thêm các chức năng cho order         
           add_filter( 'orderLink',[$this,'addOrderLink'],10,2);  
           
            // thêm route để lấy template cho bảng báo giá
            add_action('rest_api_init', [$this,'templateRoutesRegister']);

        } 

        /** 
         * thêm quotation.js đặc thù của class
         */
        public function importScript() {
            global $pagenow;
            //echo 'pagenow '. $pagenow; //post.php edit.php?post_type=product users.php user-edit.php edit.php?post_type=shop_order
            $pID = isset($_GET['post'])?$_GET['post']:0;
            $link = plugins_url().'/'.$this->pluginName.'/';
            $quotationPage = $pagenow == 'admin.php' && $_GET['page'] == $this->pageSlug;
            $editPost = $pagenow == 'edit.php' && ($_GET['post_type'] == 'product' || $_GET['post_type'] == 'shop_order');
            $postPhp = $pagenow == 'post.php' && $this->checkPostType($pID);
            $userPage = $pagenow == 'users.php' || $pagenow ==  'user-edit.php';            

            if ($quotationPage || $editPost ||  $postPhp || $userPage) {
                wp_register_script($this->handle, $link .$this->jsFile, array(),1.0, true);
 		        wp_enqueue_script($this->handle);

                 wp_register_style($this->handle.'css',$link.$this->cssFile,array(), 1.0,'all');
                 wp_enqueue_style($this->handle.'css');
                
            }            

        }

        /**
         * phần thêm form cần xử lý
         */
        public function pageContent() { ?>
        
            <div class="sheet quotation" id=sheetQuotation style='width:100%; heigt:100vh'>                 
            </div>
        
        <?php }

        /**
         * Thêm người mua vào thông tin báo giá
         */
        public function addUserToQuotation($actions,$user) {
            if ($user->roles[0] == 'customer') {
                $datajs = ['ID'=>$user->ID,  'type'=> 'User'];
                $addtopplink = '<a href=# class="updateQuotation" data='.json_encode($datajs). '><p class="title">Lập báo giá</p></a>';
                $actions= array_merge($actions,array('addtopp'=>$addtopplink ));
            }
            return $actions; 
        }
        
        /**
         * thêm sản  phẩm vào thông tin cần báo giá 
         * sản phẩm đơm hoặc tất cả các biến thể
         * ngoài trang danh sách sản phẩm
         **/ 
        public function addProductToQuotation($actions, $post)	{		
            global $pagenow;

            $editPage = isset($_GET['post_type']) && $_GET['post_type'] == 'product';
            
            if ($editPage) {    
                $datajs = array('ID'=>$post->ID,  'type'=> 'Product', 'parentID'=> 0);
                $addtopplink = '<a href=# class="updateQuotation" data='.json_encode($datajs). '>Lập báo giá</a>';
                $actions=array_merge($actions,array('addtopp'=>$addtopplink ));
            }
    
            return $actions;
    
        }

        /**
         * Thêm một button vào tab general để thêm 1 sản phẩm đơn 
         * hoặc tất cả các biến thể vào báo giá
         */
        public function addtoQuotationButton() {
            
            $data = array('ID'=>(int)$_GET['post'], 'type' => 'Product', 'parentID'=>0);
            echo $addtopplink = '<p class="form-field _name_invoice_field"><a href=# class="updateQuotation button" data='.json_encode($data).'>Lập báo giá</a></p>';                
            
        }

        /**
         * thêm một link thêm 1 biến thể vào báo giá
         */
        public function addtoQuotationButtonVariation($loop, $variation_data, $variation) {  
           
            $datajs = array('ID'=>$variation->ID, 'type'=> 'Product', 'parentID' => $variation->post_parent);            
            echo $addtopplink = '<a href=# class="updateQuotation button" data='.json_encode($datajs).' ><p class="title">Lập báo giá</p></a>';                
        }	
           
        //Thêm link add to delivery
        public function addOrderLink($link, $post) {
            $data = ['ID'=>$post->ID, 'type' => 'Order'];
            $quotationLink = '<a href=# class="updateQuotation" data='.json_encode($data).'>Lập báo giá</a>';				
            return $quotationLink ;
        }

        /**
         * phương thức lấy mẫu báo giá cho in
         */
        public function templateRoutesRegister() {
            $namespace = 'tinsinhphuc';
            register_rest_route($namespace, '/quotations', ['methods' => 'GET', 'callback' => [$this,'getTemplatesQuotation']]);
            register_rest_route($namespace, '/quotation/(?P<slug>[a-zA-z]+)', ['methods' => 'GET', 'callback' => [$this,'getTemplateQuotationBySlug']]);
        }

        // đọc nội dung file báo giá html
        public function getTemplatesQuotation() {
            $quoDir = plugin_dir_path( __DIR__) . 'templates/quotation' ;
                        
            if (! file_exists($quoDir)) return [];
            else {
                $temps = array_diff(scandir($quoDir),['.','..']);
                $template = [];
                foreach ( $temps  as $index => $temp ) {
                    array_push($template,['templateName'=> str_replace( '.html','', $temp)]);
                }
                return $template;
            }
        }

        //
        public function getTemplateQuotationBySlug($data) {
            $slug = $data->get_param('slug'); 
            $quoDir = plugin_dir_path( __DIR__) .'templates/quotation/'. $slug . '.min.html' ;
            if (! file_exists($quoDir )) return ['code'=> 'file not found'] ;
            else {
                return ['template'=> file_get_contents($quoDir), 'name'=> $slug ];
            }
            
        }
    }
    function quotationClass(){	
        return Quotation::get_instance();
    }
}
/**
 * trả về cấu trúc
 * productID
 * parentID
 * detail :{
 * name
 * specification:[
 *  {
 *  label,
 *  name
 *  },
 *  {}
 * ]
 * unit
 * quantity: [{
 *  quantity,
 *  price
 * 
 * }]
 * 
 * }
 * Name
 * Unit
 */
?>