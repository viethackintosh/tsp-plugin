<?php 
//test
require 'helpers/const.php';
if (! class_exists('Orderdoc')) {
      class Orderdoc extends Tsp {
            protected static $instance;	

            public $handle = 'orderdoc';
            public $jsFile = 'assets/scripts/orderdoc.js'; // link dẫn đến file javascript dùng để xử lý tại client
            public $cssFile= 'assets/scss/app.css'; // link dẫn đến file css

            public $uploaddir; 
		public $uploaduri;

            public static function get_instance(){
                  if( is_null( self::$instance ) ){
                      self::$instance = new self();
                  }
                  return self::$instance;
            }

            public function initClass() {
                  parent::initClass();      
                  $this->uploaddir = WP_CONTENT_DIR . '/uploads/myoptions/moreinfo/';                
                  // chỉ gọi 1 lần trong class tsp
                  add_filter( 'orderLink',[$this,'addOrderLink'],30,2);  
                  add_action('rest_api_init', [$this,'documentUploadLink']);
            }
            
            public function importScript() {
                  global $pagenow;
                  //echo 'pagenow '. $pagenow; //post.php edit.php?post_type=product users.php user-edit.php edit.php?post_type=shop_order
                  $pID = isset($_GET['post'])?$_GET['post']:0;
                  $link = plugins_url().'/'.$this->pluginName.'/';
                  $editPost = $pagenow == 'edit.php' &&  $_GET['post_type'] == 'shop_order';
                  $postPhp = $pagenow == 'post.php' && $this->checkPostType($pID);
      
                  if ( $editPost ||  $postPhp ) {
                      wp_register_script($this->handle, $link .$this->jsFile, array(),1.0, true);
                        wp_enqueue_script($this->handle);
      
                       wp_register_style($this->handle.'css',$link.$this->cssFile,array(), 1.0,'all');
                       wp_enqueue_style($this->handle.'css');
                      
                       wp_register_script('pdfviewer', '/wp-content/plugins/tinsinhphuc/assets/scripts/helpers/pdfobject.min.js', array(),1.0, true);
                       wp_enqueue_script('pdfviewer');
                  }            
      
            }

            public function documentUploadLink() {
                  $namespace = 'tinsinhphuc';
                  register_rest_route($namespace, '/document/upload', ['methods' => 'POST', 'callback' => [$this,'documentUpload']]);
                  register_rest_route($namespace, '/document/download/(?P<file>\d+)', ['methods' => 'GET', 'callback' => [$this,'documentDownload']]);
                  register_rest_route($namespace, '/document/remove', ['methods' => 'POST', 'callback' => [$this,'documentRemove']]);
            }

            public function onlyCallInParent() {
                  return;
            }

            public function addOrderLink($link, $post) {
                  $default = ['vatdoc'=>['title'=>'Tải Hoá đơn', 'file' =>''], 
                              'cus_orders'=> ['title'=>'Tải Đơn hàng', 'file' =>''],
                              'delivery_doc'=>['title'=>'Tải Phiếu Giao hàng', 'file' =>'']]; 
                  
                  $exitDoc = metadata_exists('post',$post->ID, 'orders')? get_post_meta($post->ID,'orders',true): [];
                  if (! empty($exitDoc)) $default = $this->pushDocInDefault( $exitDoc, $default);
                  $links = '';
                  foreach ($default as $key => $linkData) {
                        $links .= $this->createDocumentLink($linkData, $key, $post->ID);
                  }                  			
                  return $link .' | ' . $links ;
            }

            public function pushDocInDefault($exitDoc, $default) {
                  foreach ($exitDoc as $key => $content) {
                        $default[$key]['file'] = $content;
                  }
                  return $default;
            }

            public function createDocumentLink($linkData, $key, $ID) { 
                  $file = $linkData['file'];
                  $data = ['ID' => $ID, 'name' => $key, 'file'=>$file, 'title'=>$linkData['title']];

                  $title = $file == ''?$linkData['title']:$file;
                  
                  $delete = $file == ''? '': '<span class="dashicons dashicons-no-alt"></span>&nbsp;';
                  $titleClass = $file == ''? 'upload--document': 'preview--document';
                  $defautLink = '<a class="order--document" data=\''.json_encode($data).'\' ><span class="title '.$titleClass.'">'. $title.'</span> '. $delete.'</a> | ' ;                  
                  return $defautLink;
            }

            public function documentUpload(WP_REST_Request $req) {
                  $body = json_decode($req->get_body()); 
                  $owner = $body->owner;

                  $base64String = $body->file->fileContent;
                  $name = $body->file->name;
                  
                  // nếu chưa tồn tại file thì ghi xuống 
                  if (! file_exists($this->uploaddir.$name)) {
                        $decodedImageData = $this->decodeBase64FileContent($base64String);
                        file_put_contents($this->uploaddir.$name, $decodedImageData);
                  }
                  // lưu dữ liệu liên quan vào database
                  $exist = metadata_exists('post',$owner->ID, 'orders');

                  $exitDocument = $exist ? get_post_meta($owner->ID,'orders',true): [];                   
                  $exitDocument[ $owner->name] = $name;

                  $updateResult = $exist? update_post_meta($owner->ID, 'orders',  $exitDocument):
                                    add_post_meta($owner->ID, 'orders', $exitDocument);

                  $message = $updateResult? 'Đã tải lên & lưu dữ liệu': 'Xảy ra lỗi! vui lòng xem lại';

                  return ['code' => 200, 'result'=>  $updateResult, 'message' => $message ];
            }
            
            public function documentRemove(WP_REST_Request $req) {
                  $body = json_decode($req->get_body()); 
                  $owner = $body->owner;
                  $exitDocument =  get_post_meta($owner->ID,'orders',true);     
                  $exitDocument[$owner->name] = '';
                  $updateResult = update_post_meta($owner->ID, 'orders',  $exitDocument);

                  $message = $updateResult === true? 'Đã cập nhật': 'Có lỗi! vui lòng kiểm tra lại';
                  return ['code'=> 200, 'result'=>$updateResult, 'message'=>  $message];
            }
            public function documentDownload(WP_REST_Request $req) {
                  return ['code' => 200, 'message' => 'có file'];
            }

            public function decodeBase64FileContent($content) {
                  list($dataType, $imageData) = explode(';',  $content);                 
                  list(, $encodedImageData) = explode(',', $imageData);                  
                  $decodedImageData = base64_decode($encodedImageData);
                  return $decodedImageData;
            }
      }
      
      // giải mã code base 64 dùng ghi file 

      function orderDocClass(){	
            return Orderdoc::get_instance();
      }
}