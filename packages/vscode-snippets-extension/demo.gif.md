# Creating a Demo GIF for the Extension

A demo GIF helps users quickly understand how the extension works. **This is
optional but recommended.**

## Easiest Methods (No Command Line Required)

### Option 1: ScreenToGif (Windows - Recommended)

- Download from [screentogif.com](https://www.screentogif.com/)
- All-in-one: Record, edit, and export to GIF
- Built-in optimizer
- **Easiest option for Windows users**

### Option 2: Online Tools (Any Platform - Simplest)

1. Record screen with built-in tools:
   - **Mac**: QuickTime Player (Cmd+Shift+5) or Screenshot app
   - **Windows**: Xbox Game Bar (Win+G) or Snipping Tool
   - **Linux**: SimpleScreenRecorder or Kazam
2. Upload video to [ezgif.com/video-to-gif](https://ezgif.com/video-to-gif)
3. Set width to 800px, optimize, and download
4. **No installation required!**

### Option 3: Kap (Mac - Simple)

- Download from [getkap.co](https://getkap.co/)
- Record and export to GIF directly
- Simple, free, and Mac-native

### Option 4: Peek (Linux - Simple)

- Install via package manager: `sudo apt install peek`
- Record and save as GIF directly
- Lightweight and easy to use

## Recording Steps

1. **Setup VSCode**

   - Open a new SCSS file
   - Set zoom to 150-200% for better visibility
   - Use a clean theme (e.g., Dark+ or Light+)
   - Close unnecessary panels (keep only editor)

2. **Record the Demo** (15-30 seconds)

   Show these key features:

   a. **Spacing Tokens** (5 seconds)

   - Type `$spa` → show autocomplete
   - Select `$spacing-05`
   - Show the inserted token

   b. **Typography** (5 seconds)

   - Type `type` → show autocomplete
   - Select `@include type-style('body-01')`
   - Show the inserted mixin

   c. **Theme Tokens** (5 seconds)

   - Type `theme` → show autocomplete
   - Select `$background`
   - Show the inserted token

   d. **Imports** (5 seconds)

   - Type `@use spa` → show autocomplete
   - Select `@use spacing`
   - Show the inserted import

3. **Recording Tips**
   - Keep it smooth and deliberate
   - Pause briefly after each action
   - Don't rush - clarity over speed
   - Show the autocomplete dropdown clearly

## Optimization Guidelines

- **Dimensions**: 800-1000px width (scales well on GitHub)
- **Frame Rate**: 10-15 fps (smooth but small file size)
- **Duration**: 15-30 seconds max
- **File Size**: Target < 5MB (GitHub limit is 10MB)
- **Loop**: Set to infinite loop

## Using Online Tools (Detailed)

### ezgif.com Method (Recommended for Beginners)

1. **Record your screen**

   - Use your OS's built-in screen recorder
   - Record 15-30 seconds of snippet usage
   - Save as MP4 or MOV

2. **Convert to GIF**

   - Go to [ezgif.com/video-to-gif](https://ezgif.com/video-to-gif)
   - Upload your video
   - Click "Upload video!"

3. **Optimize**

   - Set "Size (width)" to 800
   - Click "Convert to GIF!"
   - On the next page, click "Optimize"
   - Choose "Lossy GIF" compression level 35
   - Click "Optimize GIF!"

4. **Download**
   - Click "Save" to download your optimized GIF
   - Rename to `demo.gif`

## Advanced: Command Line Tools (Optional)

Only if you're comfortable with command line:

### Method 1: Gifski (Best Quality & Size - Recommended)

```bash
# Install gifski first
# Mac: brew install gifski
# Windows: Download from https://gif.ski/
# Linux: cargo install gifski

# Convert video to optimized GIF (produces smallest files)
gifski -o demo-optimized.gif demo.mov --fps 10 --width 800 --quality 80
```

**Why Gifski?** It produces the smallest, highest-quality GIFs (typically
200-400KB).

### Method 2: ffmpeg with Two-Pass Palette (Better Compression)

```bash
# Step 1: Generate optimized color palette
ffmpeg -i demo.mov -vf "fps=10,scale=800:-1:flags=lanczos,palettegen=stats_mode=diff" -y palette.png

# Step 2: Use palette to create optimized GIF
ffmpeg -i demo.mov -i palette.png -lavfi "fps=10,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 demo-optimized.gif

# Clean up
rm palette.png
```

**Why two-pass?** Creates a custom color palette for your video, resulting in
50-70% smaller files than single-pass.

### Method 3: ffmpeg Simple (Larger Files)

```bash
# Single-pass conversion (produces larger files ~1-2MB)
ffmpeg -i demo.mov -vf "fps=10,scale=800:-1:flags=lanczos" -loop 0 demo.gif
```

**Note:** This method produces larger files. Use Gifski or two-pass method
instead.

### Comparison of Methods

| Method              | File Size | Quality   | Speed  |
| ------------------- | --------- | --------- | ------ |
| **Gifski**          | 200-400KB | Excellent | Fast   |
| **ffmpeg two-pass** | 300-500KB | Very Good | Medium |
| **ffmpeg simple**   | 1-2MB     | Good      | Fast   |
| **Online tools**    | 400-600KB | Good      | N/A    |

### Additional Optimization Tips

If your GIF is still too large, try:

```bash
# Reduce frame rate to 8 fps
gifski -o demo-optimized.gif demo.mov --fps 8 --width 800 --quality 80

# Reduce width to 600px
gifski -o demo-optimized.gif demo.mov --fps 10 --width 600 --quality 80

# Lower quality (60-70 still looks good)
gifski -o demo-optimized.gif demo.mov --fps 10 --width 800 --quality 70

# Trim video first (keep only 10-15 seconds)
ffmpeg -i demo.mov -ss 00:00:00 -t 00:00:15 -c copy demo-trimmed.mov
gifski -o demo-optimized.gif demo-trimmed.mov --fps 10 --width 800 --quality 80
```

## Adding to Extension

1. Save the optimized GIF as `demo.gif` in the extension root
2. The README already references it: `![Carbon Token Snippets Demo](demo.gif)`
3. Rebuild the extension: `yarn package`
4. The GIF will be included in the .vsix package

## Alternative: Video

Instead of a GIF, you can use a video (better quality, smaller size):

```markdown
## Demo

https://user-images.githubusercontent.com/YOUR_ID/video.mp4

_Type `theme`, `type`, or `$spacing` to see snippets in action_
```

Videos require hosting on GitHub or YouTube but have better quality and smaller
file sizes.

## Example Demo Script

```
[Start with empty SCSS file]

1. Type "$spa" slowly
   [Autocomplete appears]

2. Select "$spacing-05"
   [Token inserted: $spacing-05]

3. Press Enter, type "type"
   [Autocomplete appears]

4. Select "type-style('body-01')"
   [Mixin inserted: @include type-style('body-01');]

5. Press Enter, type "theme"
   [Autocomplete appears]

6. Select "$background"
   [Token inserted: $background]

7. Press Enter, type "@use spa"
   [Autocomplete appears]

8. Select "@use spacing"
   [Import inserted: @use '@carbon/react/scss/spacing' as *;]

[End with completed SCSS file showing all snippets]
```

## Recommended Tools Summary

| Platform    | Easiest Tool | Installation                  |
| ----------- | ------------ | ----------------------------- |
| **Windows** | ScreenToGif  | Download from screentogif.com |
| **Mac**     | Kap          | Download from getkap.co       |
| **Linux**   | Peek         | `sudo apt install peek`       |
| **Any**     | ezgif.com    | No installation (online)      |

## Next Steps

Once you have the demo.gif file:

1. Place it in `packages/vscode-snippets-extension/`
2. Run `yarn package` to rebuild
3. The demo will appear in the VSCode Marketplace listing

**Remember: The demo is optional!** The extension works perfectly without it,
but it helps users understand the value quickly.
