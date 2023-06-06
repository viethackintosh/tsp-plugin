<?php
if (! class_exists('OrderRoutes')) {
    class OrderRoutes {
        protected static $instance;	

        public static function get_instance(){
            if( is_null( self::$instance ) ){
                self::$instance = new self();
            }
            return self::$instance; 
        }
               
        public function __construct() {
            add_action('rest_api_init', [$this,'orderRoutesRegister']);
        }

        // đăng ký route cho product
        public function orderRoutesRegister() {
            $namespace = 'tinsinhphuc';
            register_rest_route($namespace, '/orders', ['methods' => 'GET', 'callback' => [$this,'orderRoutesProcess']]);
            register_rest_route($namespace, '/orders/(?P<orderId>\d+)', ['methods' => 'GET', 'callback' => [$this,'getOrderByIdRoute']]);
        } //

        public function orderRoutesProcess(WP_REST_Request $req) {
            return ['code'=> 200, 'message'=>'tạo được rest api'];
        }

        //lấy thông tin của đơn hàng lập báo giá
        public function getOrderByIdRoute($data) {               
            $orderId = $data->get_param('orderId');
            $order = wc_get_order($orderId);          
            $orderData = $order->get_data();   
            $customerID = $orderData['customer_id'];            
            
            return  
                [
                    'products'=> $this->getItemsOrder($order->get_items()), 
                    'user'=>$this->getCustomer($orderData),                    
                ];
        }

        // lấy thông tin khách hàng của order 
        public function getCustomer($orderData) {
            /*$user = [
              
                'shipping_address_1' => $orderData['shipping']['address_1'],
            ];*/
            $user = UserRoutes::filterUserField(UserRoutes::getUseByID($orderData['customer_id']));
            $user['shipping_address_1'] = $orderData['shipping']['address_1'];
            return  $user; 
        }

        // lấy thông tin của item điều chỉnh theo chuẩn báo giá
        public function getItemsOrder($items) {
            $products = [];
            foreach ($items as $key => $item) {
                $itemData = $item->get_data();
                $productId = $itemData['product_id'];
                $product = wc_get_product($productId);
                $itemInfo['attributes'] = ProductRoutes::getAttributes($product);                
                $itemInfo['parentID'] = $itemData['product_id'];
                $itemInfo['prices'] = $this->getPriceAndQuantity($itemData);
                $itemInfo['productName'] = ProductRoutes::getProductName( $product);
                $itemInfo['status'] = 'onprint';
                $itemInfo['unit'] = ProductRoutes::getUnitProduct( $product);
                array_push($products,$itemInfo);
            }
            return $products;
        }

        // lấy thông tin về giá và sản phẩm cho từng item
        public function getPriceAndQuantity($item) {

            $productid = $item['variation_id'] !== 0 ? $item['variation_id']:$item['product_id'];
            $quantity = (int)$item['quantity'];
            $price = (int)($item['subtotal']/$quantity);

            return [['productID'=>$productid, 'quantity'=> $quantity, 'price'=>$price, 'total'=>  $quantity*$price, 'note'=>'']];
        }
        
    }
    function orderRoutesClass(){	
        return OrderRoutes::get_instance();
    }
}
?>