<?php

// Test ZipArchive
var_dump(class_exists('ZipArchive'));

// Show all loaded extensions
echo "\n\nLoaded Extensions:\n";
print_r(get_loaded_extensions());

// Check if zip extension is loaded
echo "\n\nZip extension loaded: " . (extension_loaded('zip') ? 'YES' : 'NO');
