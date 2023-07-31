<?php

$GLOBALS['api'] = ['js'=>'https://www.toptal.com/developers/javascript-minifier/api/raw',
      'css'=>'https://www.toptal.com/developers/cssminifier/api/raw',
      'html'=>'https://www.toptal.com/developers/html-minifier/api/raw'
      ];
define('COMPLIER', 'scss|html|js');

function complier($dir) {
    if (! is_dir($dir)) return;
    $sanDir = array_filter(scandir($dir),'removeDisallowFile');
    if ( empty($sanDir)) return;  
    while( !empty($sanDir)) {
        $file =  array_shift($sanDir);
        if (is_file($dir. '/' .$file)) complierAPI($dir. '/' .$file);            
        else complier($dir. '/' .$file);
    }  

}

function complierAPI ($file) {   
    global $api;
    
    $fileInfo = pathinfo($file);    
    $ext = $fileInfo['extension'];

    if ($ext === 'js') {
        $kindApi = $api[$ext];
        $content = file_get_contents($file);
        $minified = getCompressFromAPI($kindApi, $content);        
        $fp = fopen($file,'w');
        fwrite($fp, $minified);
        fclose($fp);
        echo '--- complier -> '.$fileInfo['basename'] . PHP_EOL ;
      
    }
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

function removeDisallowFile($file) {
    $removeFile = '.|..|.sass-cache|app.css.map|.DS_Store';
    return strpos($removeFile, $file) === false;
}
complier(__DIR__ .'/assets');
