<?php
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

$mirror = ['target'=> 'assets/scss/'];
$api =['js'=>'https://www.toptal.com/developers/javascript-minifier/api/raw',
      'css'=>'https://www.toptal.com/developers/cssminifier/api/raw',
      'html'=>'https://www.toptal.com/developers/html-minifier/api/raw'
      ];
define('COMPLIER', 'scss|html|js');

$dir = $argv[1];
$file = $argv[3];
// outputs e.g.  somefile.txt was last modified: December 29 2002 22:16:23.
/**
 * $dir: đường dẫn thư mục gốc cần tìm file vừa được save
 * $fileIn: đường dẫn đến file hiện là file vừa được sửa (có tên file.ext)
 */
 // thư mục chứa file thay đổi sau cùng
list($name,$ext) = explode('.', $file);

$rebuildDir = str_replace('dev/', '', $dir );

if (! is_dir($rebuildDir)) mkdir($rebuildDir,0755, true);

if (strpos(COMPLIER, $ext) !== false) {     
      if ($ext == 'scss') {            
            $origin = $dir .'app.scss';
            $link = __DIR__ . '/assets/scss/app.min.css';       
            echo 'Biên dịch file '. $origin . PHP_EOL;    
            echo 'Thành file '. $link . PHP_EOL;    

            $sassRs = shell_exec('sass '. $origin .' ' . $link ." --style compressed"); 
      } else {
            $complierFile =  $dir . $file;
            $link = $rebuildDir . $file;            
            if (copy($complierFile, $link))  echo "--- đã biên dịch {$file} --- "; 
            else  echo "--- Biên dịch {$file} thất bại! --- "; 
            //$kindApi = $api[$ext];
            //$content = file_get_contents($complierFile);
            //$minified = getCompressFromAPI($kindApi, $content);            
            //$fp = fopen($link,'w');
            //fwrite($fp, $content);
            //fclose($fp);
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

