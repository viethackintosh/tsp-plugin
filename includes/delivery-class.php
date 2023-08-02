<?php
if (! class_exists('Delivery')) {
    class Delivery extends Tsp {
        protected static $instance;	

        public $menuTitle = 'Delivery';
        public $menuRole = 'manage_woocommerce';
        public $pageSlug = 'phieugiaohang'; // tên trang được tạo trong wp-admin ex: http://localhost/wp-admin/admin.php?page=post
        
        public $handle = 'delivery';
        public $jsFile = 'assets/script/delivery.js'; // link dẫn đến file javascript dùng để xử lý tại client
        public $cssFile='assets/scss/app.min.css'; // link dẫn đến file css

        public static function get_instance(){
            if( is_null( self::$instance ) ){
                self::$instance = new self();
            }
            return self::$instance;
        }
               
        public function adminMenuRegister() { 
            add_submenu_page(
                $this->menuSlug,                 
                'Delivery',
                $this->menuTitle,
                $this->menuRole,
                $this->pageSlug,
                [$this,'pageContent'],
                null
            );
        }
        
        public function initClass() {
            parent::InitClass();		
            add_filter( 'orderLink',[$this,'addOrderLink'],20,2);  
            add_action('rest_api_init', [$this,'deliveryRouteRegister']);
        } 

         /** 
         * thêm quotation.js đặc thù của class
         */ 
        public function importScript() {
            global $pagenow;
            $pID = isset($_GET['post'])?$_GET['post']:0;
            $link = plugins_url().'/'.$this->pluginName.'/';
            $quotationPage = $pagenow == 'admin.php' && $_GET['page'] == $this->pageSlug;
            $editPost = $pagenow == 'edit.php' && ($_GET['post_type'] == 'shop_order');
            $postPhp = $pagenow == 'post.php' && $this->checkPostType($pID);                  

            if ($quotationPage || $editPost ||  $postPhp ) {
                wp_register_script($this->handle, $link .$this->jsFile, array(),1.0, true);
 		        wp_enqueue_script($this->handle);

                 wp_register_style($this->handle.'css',$link.$this->cssFile,array(), 1.0,'all');
                 wp_enqueue_style($this->handle.'css');
                
            }            

        }

        //Thêm link add to delivery
        public function addOrderLink($link, $post) {                  
            $data = ['ID'=>$post->ID];
            $addtodelivery = '<a href=# class="updateDelivery" data='.json_encode($data).'><p class="title">Lập phiếu giao hàng</p></a>';
            return $link . ' | ' .$addtodelivery;
        }
       
        public function deliveryRouteRegister() {
            $namespace = 'tinsinhphuc';            
            register_rest_route($namespace, '/delivery/(?P<slug>[a-zA-z]+)', ['methods' => 'GET', 'callback' => [$this,'getTemplateDeliveryBySlug']]);
        }
        // không dùng lại productUnitAndSavePost tại class init
        public function onlyCallInParent() {
            return;
        }
        
        
        public function pageContent() { ?>
        
            <div class="delivery sheet" id=delivery style='width:100%'>                            
            </div>
        
        <?php }
       
       public function getTemplateDeliveryBySlug($data) {
            $slug = $data->get_param('slug'); 
            $deliveryDir = plugin_dir_path( __DIR__) .'templates/delivery/'. $slug . '.min.html' ;
            if (! file_exists($deliveryDir )) return ['code'=> $deliveryDir] ;
            else {
                return ['template'=> file_get_contents($deliveryDir), 'name'=> $slug ];
            }
       }
    }
    function deliveryClass(){	
        return Delivery::get_instance();
    }
}
?>