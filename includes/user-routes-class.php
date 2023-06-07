<?php
if (! class_exists('UserRoutes')) {
    class UserRoutes {
        protected static $instance;	

        public static function get_instance(){
            if( is_null( self::$instance ) ){
                self::$instance = new self();
            }
            return self::$instance;
        }
               
        public function __construct() {
            add_action('rest_api_init', [$this,'userRoutesRegister']);
        }

        // đăng ký route cho product
        public function userRoutesRegister() {
            $namespace = 'tinsinhphuc';
            register_rest_route($namespace, '/users', ['methods' => 'GET', 'callback' => [$this,'userRoutesProcess']]);
            register_rest_route($namespace, '/user/(?P<userid>\d+)', ['methods' => 'GET', 'callback' => [$this,'getUserByIdRoute']]);
        }

        public function userRoutesProcess(WP_REST_Request $req) {
            return ['code'=> 200, 'message'=>'tạo được rest api'];
        }
         
        //lấy thông tin người dùng theo userid
        public function getUserByIdRoute($data) {
            $user = $data->get_param('userid');
            $cusinfo = $this->filterUserField($this->getUseByID($user));
            $cusinfo['user_id'] = (int)$user;
            return ['user'=> $cusinfo];
        }

        // lấy thông tin của user 
        public static function getUseByID($id) {
            return get_user_meta((int)$id,'',true);            
        }

        // lọc các trường cần thiết thông tin khách hàng
        public static function filterUserField($user) {
            $filer = 'user_id|nickname|first_name|last_name|billing_company|billing_address_1|billing_phone|shipping_phone|billing_email';
            $userOut = [];
            foreach ($user as $key => $meta) {
                if (strpos($filer, $key) != false ) $userOut[$key] = $meta[0];
            }
            return $userOut;

        }
    }
    function userRoutesClass(){	
        return UserRoutes::get_instance();
    }
}
?>