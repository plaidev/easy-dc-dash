#!bin/bash

files=$(ls);
for file in $files;
do
  ext="${file##*.}"
  if [ "$ext" = "topojson" ]; then
    toposimplify -P 0.001 -o $file.json $file;
  fi
done
 
