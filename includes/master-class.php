<?php 

if (! class_exists('Master')) {
    class Master { 
        protected static $instance;	
        
        public $menuSlug = '';
        public $menuTitle='';
        public $pageSlug = ''; // tên trang được tạo trong wp-admin ex: http://localhost/wp-admin/admin.php?page=post
        public $pluginName ='';  
       
        public $handle =''; // id cho file javascript        
        public $jsFile = ''; // link dẫn đến file javascript dùng để xử lý tại client
        public $cssFile=''; // link dẫn đến file css
        public $typeJS ='module'; // type=modules; hoặc bình thường ''

        public static function get_instance(){
            if( is_null( self::$instance ) ){
                self::$instance = new self();
            }
            return self::$instance;
        }
 
        public function __construct() {        
            add_action('admin_menu', [$this,'adminMenuRegister']); 
            $this->initClass();

        }

        public function initClass() {
            add_action('admin_enqueue_scripts', [$this,'importScript']);
            $this->typeModule();                        
        }

        public function adminMenuRegister() {
           
            if ($this-> menuSlug == '' || $this->pageSlug == '') return;
            add_menu_page(
                '',                
                $this->menuTitle,
                'manage_options',
                $this->menuSlug,                
                [$this,'pageContent'],
                '',
                32
            );        
            
        }

        public function pageContent() {
           return;
        }

        public function importScript() {
         
        }

        public function typeModule() {

            if ($this->typeJS != 'module') return;
            add_filter('script_loader_tag', [$this,'moduleScript'] , 10, 3);

        }
        public function moduleScript($tag, $handle, $src) {
            
            if ( $this->handle !== $handle ) {
                return $tag;
            }
            // change the script tag by adding type="module" and return it.
            $tag = '<script type="module" src="' . esc_url( $src ) . '" defer></script>';
            return $tag;
        }
    }
}
