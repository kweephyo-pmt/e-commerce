# Cloudinary Image Upload Setup Guide

This guide will help you set up Cloudinary for image uploads in the admin dashboard.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. After signing up, you'll be redirected to your dashboard

## Step 2: Get Your Cloud Name

1. On your Cloudinary dashboard, you'll see your **Cloud name** at the top
2. Copy this cloud name

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** (gear icon)
2. Click on the **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `products` (or any name you prefer)
   - **Signing Mode**: Select **Unsigned** (important!)
   - **Folder**: `products` (optional, organizes your images)
   - **Allowed formats**: jpg, png, gif, webp
   - **Transformation**: You can add automatic optimizations here
6. Click **Save**
7. Copy the **preset name** you just created

## Step 4: Add Environment Variables

1. Open your `.env` file (or create one if it doesn't exist)
2. Add these two lines:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
```

3. Replace `your_cloud_name_here` with your actual cloud name
4. Replace `your_preset_name_here` with your upload preset name

## Step 5: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## How to Use

1. Go to the Admin Dashboard
2. Click "Add Product" or edit an existing product
3. In the "Product Image" section, click **Upload Image**
4. The Cloudinary upload widget will open
5. You can:
   - Upload from your computer
   - Take a photo with your camera
   - Provide a URL
6. Crop and edit the image if needed
7. Click **Done** to upload

The image URL will be automatically saved to your product!

## Features

- ✅ Drag and drop upload
- ✅ Image cropping (1:1 aspect ratio)
- ✅ Automatic optimization
- ✅ Max file size: 5MB
- ✅ Supported formats: JPG, PNG, GIF, WebP
- ✅ Image preview before saving
- ✅ Organized in 'products' folder

## Troubleshooting

### "Upload widget not opening"
- Make sure you've added the Cloudinary script to `index.html`
- Check browser console for errors
- Verify your cloud name and upload preset are correct

### "Upload failed"
- Check that your upload preset is set to **Unsigned**
- Verify the file size is under 5MB
- Make sure the file format is supported

### "Image not showing"
- Check that the upload was successful
- Verify the image URL is saved in the form
- Check browser console for errors

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations per month

This is more than enough for most small to medium e-commerce sites!
