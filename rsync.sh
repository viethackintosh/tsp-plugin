#!/bin/bash
while true; do
inotifywait -e modify,create,delete -r ../tinsinhphuc
php watch.php
done       
