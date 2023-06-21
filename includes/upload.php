<?php 
if (isset($_POST['owner'])) {
    $files = $_FILES['file'];
    //$code = move_uploaded_file($file['tmp_name'],__DIR__.'/uploads' . '/' . $file['name']);
    echo json_encode(['code'=>$files]);
}
else echo json_encode(['code'=> 400]); 