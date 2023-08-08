#!/bin/bash
while true; do
inotifywait -e modify,create,delete -r ../tinsinhphuc | while read FILE
    do php watch.php $FILE; done
done       
