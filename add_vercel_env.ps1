$envs = @{
    VITE_FIREBASE_API_KEY = "AIzaSyDvW_icRWILabKlM9eY3V2nCAIKKQ34HtQ"
    VITE_FIREBASE_AUTH_DOMAIN = "iframeyouu-1ab25.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID = "iframeyouu-1ab25"
    VITE_FIREBASE_STORAGE_BUCKET = "iframeyouu-1ab25.firebasestorage.app"
    VITE_FIREBASE_MESSAGING_SENDER_ID = "51796046311"
    VITE_FIREBASE_APP_ID = "1:51796046311:web:be10ba97c620222e268d42"
    VITE_CLOUDINARY_CLOUD_NAME = "doyqnuayp"
    VITE_CLOUDINARY_UPLOAD_PRESET = "iframeyou-present"
}

foreach ($key in $envs.Keys) {
    $value = $envs[$key]
    foreach ($env in @("production","preview")) {
        $input = "$value`nY`nY"
        $input | vercel env add $key $env
    }
}
