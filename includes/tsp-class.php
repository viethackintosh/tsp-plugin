<?php
if (! class_exists('tsp')) {
  class Tsp extends Master{
    protected static $instance;	
            
    public $menuSlug = 'baogia';
    public $menuTitle='Hồ sơ - Giấy tờ';

    // tên trang được tạo trong wp-admin ex: http://localhost/wp-admin/admin.php?page=post
    public $pluginName ='tinsinhphuc';            

    /**
     * khởi tạo 1 class
     */
    public static function get_instance(){
        if( is_null( self::$instance ) ){ 
            self::$instance = new self();
        }
        return self::$instance;
    }

    // thêm các khởi tạo khác, gọi trong __construct()
    public function initClass() {
        parent::initClass();         
          // chỉ gọi 1 lần trong class tsp
        $this->onlyCallInParent(); // chỉ gọi 1 lần trong class tsp
        add_action('admin_enqueue_scripts', [$this,'mediaBox']);
    }        
    
    // chỉ gọi 1 lần trong class tsp
    public function onlyCallInParent() {
        $this->productUnitAndSavePost();
        add_action( 'manage_shop_order_posts_custom_column',[$this,'AddOrderVATData'],20,1);      
    }

    //tạo các link chức năng co đơn hàng
    public function AddOrderVATData($column) {
      global $post;
      if ('order_number' === $column) {
          $quotationLink = '';				
          echo '<div class="funcs-wrapper">'. apply_filters('orderLink',$quotationLink,$post). '</div>';             
      }
    }	
    public function mediaBox() {
      wp_enqueue_media();
    }

    // thực hiện lưu lại 
    public function productUnitAndSavePost() {
        add_action( 'woocommerce_product_options_general_product_data',[$this,'productUnit'],10);
        add_action( 'save_post', [$this,'saveCostPriceSingleProduct']);          
    }
  
    // thêm tên sản phẩm trong hoá đơn và dơn vị tính 
    public function productUnit() {
        woocommerce_wp_text_input( [ 'id' => '_unit_product', 'class' => 'short', 'label' => __( 'Đơn vị tính', 'woocommerce' )]);
        woocommerce_wp_text_input( [ 'id' => '_name_invoice', 'class' => 'short', 'label' => __( 'Tên trong hóa đơn', 'woocommerce' )]);
      }

      // method lưu đơn vị tính và tên trong hoá đơn của sàn phẩm
      public function saveCostPriceSingleProduct($product_id) {
        if (wp_verify_nonce(isset($_POST['_inline_edit']), 'inlineeditnonce'))
          return;   
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
          return;        
        
        if (isset($_POST['_unit_product'])) {
          if (metadata_exists ('post',$product_id,'_unit_product'))         
            update_post_meta( $product_id, '_unit_product', $_POST['_unit_product'] ); 
          else add_post_meta($product_id,'_unit_product',$_POST['_unit_product']);
        } 
    
        if (isset($_POST['_name_invoice'])) {
          if (metadata_exists ('post',$product_id,'_name_invoice'))         
            update_post_meta( $product_id, '_name_invoice', $_POST['_name_invoice'] ); 
          else add_post_meta($product_id,'_name_invoice',$_POST['_name_invoice']);
        }   
      }
    
    /**
     * kiểm tra post_type với 1 ID (post_ID)
     * post_type: shop_order, product -> true; <- false
     */
    public function checkPostType($ID) {
        $gPost = get_post($ID);
        return $gPost->post_type == 'product' || $gPost->post_type == 'shop_order';
    }      
  }       
}
    
?>
