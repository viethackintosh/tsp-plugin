<?php
//ck_9f25037e31e6ecc87be86946ea68f5fbe4e1e25b
if (! class_exists('ProductRoutes')) {
    class ProductRoutes {
        protected static $instance;	

        public static function get_instance(){
            if( is_null( self::$instance ) ){
                self::$instance = new self();
            }
            return self::$instance;
        }
               
        public function __construct() {
            add_action('rest_api_init', [$this,'productRoutesRegister']);
        }

        // đăng ký route cho product
        public function productRoutesRegister() {
            $namespace = 'tinsinhphuc';
            register_rest_route($namespace, '/products', ['methods' => 'GET', 'callback' => [$this,'productRoutesProcess']]);
            register_rest_route($namespace, '/product/(?P<id>\d+)', ['methods' => 'GET', 'callback' => [$this,'getProductById']]);
        } 

        // xử lý các route thương product bằng methods
        public function productRoutesProcess(WP_REST_Request $req) {
            return ['code'=> 200, 'message'=>'tạo được rest api'];
        }

        /** các function lấy dữ liệu thông qua id  */
        // lấy dữ liệu về product thông qua id
        public function getProductById($data) {
            $proID = (int)$data->get_param('id');
            $inproduct = $this->getProductInfomation($proID);           
            return ['product'=> $inproduct];
        }

        // lấy da
        public function getProductInfomation($proID) {
            $product = wc_get_product($proID);
            $pro = [];  
            $pro['parentID'] = $this->getParentID($product);
            $pro['productName'] = $this->getProductName($product);
            $pro['unit'] = $this->getUnitProduct($product);
            $pro['attributes'] = $this->getAttributes($product);
            $pro['prices'] =$this->getQuantityAndPrices($product);
            return $pro ;
        }

        // lấy id sản phẩm cha để so sánh thêm vào thông tin
        public function getParentID($product) {           
            return $product->is_type('variation')? $product->get_parent_id():$product->get_id();
        }

        //lấy tên sản phẩm 
        public function getProductName($product) {
            $realName  = '';       
            //$product = wc_get_product($proID);
            $product = $product->is_type('variation')? wc_get_product($product->get_parent_id()):$product;    
            $realName = $product->get_name();
            if (metadata_exists ('post',$product->get_id(),'_name_invoice')) {
                $nameInVat = get_post_meta($product->get_id(), '_name_invoice',true );
                if ($nameInVat != '') $realName =  $nameInVat;     
            }                    
            return $realName;
        }

        //lấy đơn vị sản phẩm
        public function getUnitProduct($product) {
            $unit  = 'pcs';         
            $product = $product->is_type('variation')? wc_get_product($product->get_parent_id()):$product;            
            if (metadata_exists ('post', $product->get_id(),'_unit_product')) {
                $tempUnit = get_post_meta(  $product->get_id(), '_unit_product',true );
                if ($tempUnit != '') $unit =  $tempUnit   ;     
            }                      
            return $unit;
        }

        // lấy các thuộc tính sản phẩm
        public function getAttributes($product) {
            
            $product = $product->is_type('variation')? wc_get_product($product->get_parent_id()):$product;   
            $attributes = $product->get_attributes();
            $list = [];
          
            foreach ( $attributes as $index => $attribute ) {
               
                $attrData = $attribute->get_data();
                if ( $attrData['is_variation'] != 1) {
                    $temp = [
                         // lấy nhãn của thuộc tính sản phẩm
                        'label' => wc_attribute_label($attrData['name']),
                        // trả lại nội dung của thuộc tính sản phẩm theo nhãn
                        'name'=> $product->get_attribute($attribute['name']),
                        'slug'=> $attribute['name']]; // trả lại nội dung của thuộc tính sản phẩm theo nhãn                   
                   $list[] = $temp;
                }
                
            }
            
            return $list;
        }

        //get quantity and price
        public function getQuantityAndPrices($product) {                       
            $prefix = $product->get_type();
            // simple, variation, varible
            $fn = 'getQuantityAndPricesFor'. $prefix;

            return $this->$fn($product);
        }

        //lấy số lượng và đơn giá của sản phẩm simple
        public function getQuantityAndPricesForSimple($product) {
            // trả về array giá 
            return [['productID' => $product->get_id(),
                    'quantity'=>1, 
                    'price'=> (int)$product->get_price()]];
        }

        // lấy giá và số lượng cho sản phẩm cóbiến thể 
        public function getQuantityAndPricesForVariable($product) {
            $prices = [];	
            if ($product->has_child()) {	
                $childs = $product->get_children();			
                foreach ($childs as $index => $childID) {	                    
                    $childProduct = wc_get_product($childID);			
                    $temp = ['productID' => $childID,
                            'quantity'=> (int)str_replace(',','',$childProduct->get_attribute('pa_so-luong')), 
                            'price'=> (int)$childProduct->get_price()];			 
                    $prices[] = $temp;
                }
		    }
		return $prices;
        }

        //lấy giá và số lượng của sản phẩm biến thể con
        public function getQuantityAndPricesForvariation($product) {
            // trả về array giá thống nhất với trường hợp sản phẩm variable
            return [[ 'productID' => $product->get_id(),
                    'quantity'=> (int)str_replace(',','',$product->get_attribute('pa_so-luong')), 
                    'price'=> (int)$product->get_price()]];
            
        }
        /** kết thúc các function lấy dữ liệu thông qua id  */
              
    }
    function productRoutesClass(){
        return ProductRoutes::get_instance();
    }
}
?>