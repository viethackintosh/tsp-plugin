<?php
// outputs e.g.  somefile.txt was last modified: December 29 2002 22:16:23.
/**
 * $dir: đường dẫn thư mục gốc cần tìm file vừa được save
 * $fileIn: đường dẫn đến file hiện là file vừa được sửa (có tên file.ext)
 */
$mirror = ['target'=> 'assets/scss/'];
$api =['js'=>'https://www.toptal.com/developers/javascript-minifier/api/raw',
      'css'=>'https://www.toptal.com/developers/cssminifier/api/raw',
      'html'=>'https://www.toptal.com/developers/html-minifier/api/raw'
      ];
define('COMPLIER', 'scss|html|js');

// trả về file sửa cuối cùng
function lastUpdateFile($dir, $checkedFile) {    
      $fileIn = $checkedFile;
      if (is_dir($dir)) {            
            $listIn = array_filter(scandir($dir) ,'removeOrginSub');
            if (empty($listIn)) return $fileIn;
            while (!empty($listIn)) {
                  $checkFile = $dir . '/'. array_shift($listIn);
                  if (is_file($checkFile)) {
                        if ($fileIn != '') $fileIn = filemtime($fileIn) > filemtime($checkFile) ? $fileIn : $checkFile;   
                        else $fileIn = $checkFile; 
                  } else $fileIn = lastUpdateFile( $checkFile, $fileIn);
            }
      }
      return $fileIn;
} 

// trả về đường dẫn cơ sở


function removeOrginSub($fileName) {
      $removeFile = '.|..|.sass-cache|app.css.map|.DS_Store';
      return strpos($removeFile, $fileName) === false;
}

function getCompressFromAPI($api, $content) {
      $ch = curl_init();

      curl_setopt_array($ch, [
          CURLOPT_URL => $api,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_POST => true,
          CURLOPT_HTTPHEADER => ["Content-Type: application/x-www-form-urlencoded"],
          CURLOPT_POSTFIELDS => http_build_query([ 'input' => $content ])
      ]);
  
      $minified = curl_exec($ch);
  
      // finally, close the request
      curl_close($ch);
  
      // output the $minified JavaScript
      return $minified;
}

$lastUpdateFile = lastUpdateFile(__DIR__ ,''); //đường dẫn đến file được lưu lại sau cùng
$fileInfo = pathinfo($lastUpdateFile); // lấy thông tin của file
$targetDir =  $fileInfo['dirname']; // thư mục chứa file thay đổi sau cùng
$ext = $fileInfo['extension']; // lấy phần mở rộng của file thay đổi sau cùng
$rebuildDir = str_replace('dev/', '', $targetDir);
if (! is_dir($rebuildDir)) mkdir($rebuildDir,0755, true);
echo __DIR__ . PHP_EOL;
if (strpos(COMPLIER, $ext) !== false) {     
      if ($ext == 'scss') {            
            $origin = __DIR__ .'/dev/assets/css/app.scss';
            $link = __DIR__ . '/assets/scss/app.min.css';       
            echo 'Biên dịch file '. $origin . PHP_EOL ;    
            $sassRs = shell_exec('sass '.$origin .' ' . $link .' --style compressed'); 
      } else { 

            $link = $rebuildDir .'/'.$fileInfo['basename'];
            $kindApi = $api[$ext];
            $content = file_get_contents($lastUpdateFile);
            //$minified = getCompressFromAPI($kindApi, $content);            
            $fp = fopen($link,'w');
            fwrite($fp, $content);
            fclose($fp);
            echo '--- đã biên dịch --- '; 
      } 
}

//$output = shell_exec('rsync -avzhe ssh --progress --delete --exclude-from=exclude.txt  --chown=www-data:www-data --perms --chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r ' .__DIR__. '/  root@45.32.123.235:/home/nginx/sites/indepgiasi/blog/wp-content/plugins/tinsinhphuc/');
//echo $output;

/**
 * git init
 * git add .
 * git commit -m "comment"
 * git remote add origin git@github.com:viethackintosh/modal.git
 * git switch -c main
 * git push --set-upstream origin main
 */
?>

