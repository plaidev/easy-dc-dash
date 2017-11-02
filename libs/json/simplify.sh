#!bin/bash

files=$(ls);
for file in $files;
do
  ext="${file##*.}"
  if [ "$ext" = "topojson" ]; then
    toposimplify -P 0.01 -o $file.json $file;
  fi
done
 
