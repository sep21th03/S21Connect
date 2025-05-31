<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),
    'secure' => true,
    
    'upload' => [
        'max_file_size' => 10000, 
        'max_files' => 10,
        'allowed_formats' => [
            'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'video' => ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm']
        ]
    ]
];