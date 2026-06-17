![](https://www.youtube.com/watch?v=DTTNSjyEtes)

Learn how to play video on scroll using HTML, CSS, JavaScript, GSAP, and ScrollTrigger. No video tag, just smooth frame by frame canvas animation.  
  
Source Code: https://codegrid.gumroad.com/l/codegridpro  
  
Inspiration: Adaline  
Website: https://www.adaline.ai/  
  
Stock Video Used: https://www.pexels.com/video/a-desert-with-sand-dunes-and-some-bushes-19376556/  
  
TIFF to JPG Batch Conversion — Run this command inside your frames directory to convert all TIFF files to JPG:  
for file in frame\_\*.tif; do  
sips -s format jpeg "$file" --out "${file%.tif}.jpg"  
done  
  
Timestamps:  
0:00 Intro  
1:22 Assets  
3:47 HTML  
5:36 CSS  
10:47 JavaScript  
  
Instagram: https://www.instagram.com/codegridweb/  
Twitter: https://twitter.com/codegridweb/  
Public Discord: https://discord.gg/B8B9MXxuSS  
  
Music from Epidemic Sound.  
Thanks for watching!

## Transcript

### Intro

**0:00** · Just a few days ago on July 31st, this site was featured as site of the day on awards. And right from the landing page, you are met with the stunning scroll animation. The navigation fades out. The header content moves backward in 3D space. And in the background, a video plays frame by frame as you scroll.

**0:16** · Toward the end of the sequence, a dashboard image fades in with a smooth dimensional motion that also feels fully 3D. Lately, I have been noticing this kind of effect showing up on quite a few other award-winning sites, too, where the scroll controls a frame by frame video playback instead of using a standard video element. And in this case, it's paired with some really thoughtful motion design that ties the whole experience together seamlessly. I thought it would be something fun and useful to cover here on the channel. So, I put together a similar experience using just JavaScript, GSAP, and scroll trigger.

**0:47** · As you scroll, the background video plays frame by frame while other elements come to life in sync, just like on the original site. In this video, I'll walk you through exactly how to build this effect from scratch. We'll go step by step from asset prep and canvas setup to scroll driven animations. So, even if you are new to this, you should be able to follow along. And if you'd like to access the source code for this project along with hundreds of other similar micro projects and a brand new website template every month, you can check out the pro membership via the link in the description. All right, let's get into it.

**1:21** · Let's talk about what you'll need in terms of the assets for this project.

### Assets

**1:25** · First off, you'll need a video to work with. You can grab any clip from a stock footage site. I downloaded this one from Pixels. I'll leave the link in the description in case you want to use the same one. Now, there are a few different ways to build this type of scroll experience. From what I have observed, most of the award-winning sites that use this effect are actually using an image sequence behind the scenes. So, even though it looks like a video playing on scroll, what's really happening is that a bunch of individual images are being swept out frame by frame. And that's the exact approach we'll use in this video.

**1:56** · To create an image sequence from a video, you can try using any of the free online tools out there. But I found that most of them skip frames and don't export every single one which means you will end up with fewer images and a choppy laggy playback. For this kind of effect to fail smooth, you want as many frames as possible. So here is the method I used. What you are seeing here is the video opened in a video editing software called Denture Resolve. I'm using the free version and you can too.

**2:23** · Once your video is imported, you can export an image sequence from it by following the exact settings shown in the video. This will give you a high number of individual frames. In my case, over 200 and they'll be exported in TIFF format. Unfortunately, I couldn't find a way to export them directly as JPEGs, but that's not the problem. We'll convert them in the next step. So, now I've got all these TIFF frames saved inside a folder called frames on my desktop.

**2:47** · To convert them to JPG, you could use an online batch converter, but most of those have a limit on how many files you can upload at once, which can be a hassle. So instead I used a quick command line technique with the help of chat GPT. First you open up a terminal and make sure you are inside the correct directory. It's important to double check that before running any commands otherwise you'll run into errors obviously. Then you can run this simple oneliner command which instantly converts all the TIFF files into JPEG format.

**3:15** · I'll include the exact command in the description so you can copy it from there. Once that's done, you will have both versions of the frames in your folder, TIFF and JPEG. For this project, you only need the JPG files. So, you can go ahead and delete the tips using the second command. And that's it. You now have a clean folder with over 200 JPEG frames ready to be dropped into your project. Just move this folder into your project directory. And we'll use these images to build our scroll experience.

**3:43** · All right, let's move on and set up the HTML.

### HTML

**3:47** · First, we'll add a nav element at the top for our navigation bar. I'm dividing this into three sections. the nav links, the logo, and the nav buttons. Inside the nav links container, I'll add three anchor tags with some placeholder labels. For the logo section, I'll add an image followed by the site name. And in the nav buttons container, I'll add two more anchor links each wrapped inside a div with the class button. One will use the primary class and the other will use secondary just so we can style them later differently. Next, we'll add two main sections to the page, a hero section and an outro.

**4:18** · Inside the hero section, the first thing I'm going to drop in is a canvas element. This is where we'll render our image sequence, the one that simulates video playback on scroll. Right after the canvas, I'll add a container called hero content. Inside this, we'll add another div called header. The reason we are nesting these two is because we'll use the outer hero content for positioning and the inner header for applying 3D transforms.

**4:43** · Keeping the two layers of styling separate. Inside the header div, I'll place an H1 with some placeholder text, followed by a paragraph tag with a simple line for the client logos. Then right below that, I'll create a div called client logos. Inside it, we'll add four logo images, each wrapped inside a div with the class client logo.

**5:01** · This gives us a nice clean row we can style later. Outside of the header, still inside the hero section, I'll add another container to hold the dashboard image. This one will be a div with the class hero image container. And inside it, we'll add another div called hero image, which will contain the actual image tag. Lastly, inside the outro section, we'll just have an H1 with some placeholder text, mainly to give the scroll some breathing room and make sure the page doesn't end too abruptly. And that's pretty much the entire HTML structure we need for this project.

**5:31** · Next, we'll move on to styling everything with CSS.

### CSS

**5:36** · First, I'm importing two fonts from Google Fonts. One for the main body text and one for the headings. Next, I'm setting up the color scheme using CSS variables. There is one for the main text color and one for the background.

**5:49** · This just makes it easier to manage colors across the entire project and keep everything consistent. Then, I'm resetting the defaults. I am removing the browser's default spacing and using a consistent box sizing to avoid any layout weirdness later on. For the body, I'm applying our main font so the whole site has a clean, minimal baseline. Now for the images, I'm making sure they always fill their container and crop properly without distortion. This helps them look polished no matter the layout.

**6:15** · For the headings, I'm switching to our second font. They are styled to be large, light in weight, and spaced tightly so the text feels bold but still refined. Then for the small text elements like labels and links, I'm uppercasing the text, making it a bit smaller and giving it a slightly heavier weight to keep it readable but subtle.

**6:34** · links also have their underline removed and inherit the brand color we defined earlier.

**6:44** · Next up are the buttons. I am adding some spacing inside each one and slightly rounding the corners. There are two types of buttons, a light one and a dark one, each styled using a separate class.

**7:03** · Then we move on to the navigation. It's fixed at the top and spans the full width of the screen. There is padding on the sides and I'm using flex layout to space out the inner content with some breathing room. It's also layered above everything else using a higher striking order and the opacity is optimized for animation. Each child inside the nav is given equal space using flex and I've applied horizontal spacing between the navigation links.

**7:29** · The logo section is centered vertically and styled with our heading font for the text. The logo image itself is scaled down to a small clean size.

**7:44** · \[Music\] On the right, the nav buttons are aligned using flex and space to keep things balanced visually.

**8:01** · Next, we style the sections. Each section takes up the full screen and hides any overflow, which gives our animation a full screen canvas to work with.

**8:10** · For the outro section, I'll center the content both vertically and horizontally using flexbox. I'll add a bit of padding and apply our color variables for background and text. This gives the page a clean finish after the scroll sequence.

**8:25** · Next, I'll style the canvas. I'll make it fill the entire screen and crop anything outside the bounds. Just like with the images, this is where we'll render the image sequence for the scroll driven animations. Now, for the hero content, I'll absolutely position it, move it slightly down from the top, and apply 3D perspective.

**8:43** · This setup lets us animate depth later on.

**8:47** · I'm also adding some padding to keep the spacing clean.

**8:52** · Inside that I'll style the header container. I'll center it using transforms.

**8:58** · Stack the text elements vertically and give them a bit of spacing.

**9:22** · The heading gets a fixed width so it doesn't stretch across the screen.

**9:28** · And the label below it is slightly transparent to make it more subtle.

**9:32** · Next, I'll style the client logo section. I'll keep it narrow and arrange the logos in a row with small gaps.

**9:39** · Each logo sits inside its own wrapper so we can control spacing easily.

**9:45** · And I'll make sure the logos themselves crop properly without distortion.

**9:53** · For the dashboard image container, I'll center it on the screen and apply the same 3D setup as before.

**10:10** · The image inside starts off fully transparent and pushed forward in 3D space.

**10:16** · We'll animate this into view later using scroll.

**10:26** · Lastly, I'll add a media query to handle smaller screens. In this case, I'll reduce the heading size, add the nav links and buttons, and make sure the key layout elements like the text and logos scale down to fit mobile.

**10:40** · And that wraps up the CSS. Next, we'll move on to the JavaScript and start bringing everything to life.

### JavaScript

**10:47** · At the very top, I'll import the libraries we are going to use. First, I'm importing GSA, the animation library that will power everything in this project. Then I'll bring in scroll trigger plug-in from GAP which lets us try animations directly to scroll behavior. And finally I'll import Lennis which is a smooth scrolling utility. Now to make sure all our code runs only after the page has been fully loaded.

**11:08** · I'm wrapping everything inside a DOM content loaded event. Inside this block the first thing I'll do is register the scroll trigger plug-in with GSAP that gives us access to all the scroll based features we are going to use. Next I'll set up the Lennis. I have taken this block of code directly from the Lennis documentation. Here I'll create a new scrolling instance and connect it to scroll trigger. So whenever we scroll, scroll trigger stays in sync. After that, I'll connect Lennis to GSAP's internal animation loop. This just tells Gap to drive Lenny smoothly on every frame.

**11:38** · So the scroll feels extra polished. So with that, we now have smooth scrolling setup and fully in sync with GSAP. Next, I'll start grabbing the main elements we are going to animate or work with. I'm selecting the navigation bar, the header text, the hero image, the canvas element that we'll use to render the frame by frame animation.

**11:57** · Now, let's set up the canvas. I'll start by grabbing the drawing context from the canvas element. This gives us access to the 2D rendering surface, which we'll use to manually draw each frame of the image sequence. Without this, we wouldn't be able to render anything visually to the canvas. Next, I'll create a function that handles the canvas sizing. Inside this function, the first thing I'll do is check the devices pixel ratio. This is important because high resolution displays like retina screens use more pixels per inch. If we ignore that, everything drawn on the canvas would appear blurry or maybe low quality.

**12:30** · So, I'll multiply the canvas's width and height by that pixel ratio to give us a much higher resolution output.

**12:36** · Then, I'll update the actual visible width and height of the canvas using plain pixel values based on the current window size. This makes sure the canvas fills the screen exactly regardless of the screen size or resolution. But just updating the size isn't enough since we manually increased the resolution earlier. We now need to scale the entire drawing context. This step ensures that anything we draw later like an image shows up at the correct size and position. Without the scaling, all the drawing would appear zoomed out or off center.

**13:04** · Finally, I'll call this function right away so the canvas is properly initialized as soon as the page loads.

**13:10** · This setup ensures the canvas is crisp, full screen, and ready to render highresolution image frames smoothly.

**13:16** · Now, let's talk about how we load and render the image sequence that powers the background animation. First, I'll define how many frames we need. In my case, I've got just over 200 images exported from the video, and we'll treat each one as an individual frame in the animation. Then, I'll create a helper function that takes a frame number and returns the corresponding image file name. Each file in our folder is named with a four-digit number. So this function just formats the number properly and points to the correct file path. Next, I'll set up an array to hold all of the image objects we are going to load.

**13:47** · We'll store them in memory so we can draw each one instantly as user scrolls. No delays or lag from loading on demand. Then I'll create a simple object to keep track of the current frame number. We'll update this later based on scroll progress and use it to decide which image to render at any given moment. I'll also set up a counter to track how many images still need to be loaded. We'll start with the full number of frames and decrease it each time an image finishes loading. Now I'll create a function that runs every time a new image loads. Each time it runs, I'll subtract one from the remaining count.

**14:20** · And once all images are fully loaded, meaning the counter hits zero, I'll immediately render the first frame and also kick off our scroll animation setup. Then comes the loading loop. Here I'll go through each frame number and create a new image object for it. I'll assign a load event to each image so that once it's ready, we know to update our loading tracker. Just in case an image fails to load, I'll also attach an error handler that still triggers the same logic. This prevents the whole animation from stalling if even one frame is missing. Then I'll set the source path for that image and push it into the array we made earlier.

**14:52** · By the end of this loop, we'll have a fully loaded image sequence stored in memory ready to animate smoothly. Next, I'll define the render function. This is the part that actually draws an image frame to the canvas based on the current scroll position. First, I'll get the current width and height of the canvas.

**15:09** · Since the canvas fills the screen, this just gives us the dimensions we'll use to render the image. Then, I'll clear anything previously drawn on the canvas.

**15:17** · This ensures we are only showing the current frame and not layering images on top of each other. After that, I'll grab the image corresponding to the current frame number. We'll make sure it's fully loaded and has valid dimensions before trying to draw it. Once that's confirmed, I'll calculate the aspect ratio of the image and compare it to the canvas aspect ratio. This helps us determine whether to scale based on width or height so we can maintain the original proportions of the image and avoid any stretching. If the image is wider than the canvas, I'll scale it based on height and center it horizontally.

**15:48** · If it's taller, I'll scale it based on width and center it vertically. Then I'll draw the image on the canvas using those calculated dimensions and position. This ensures that no matter what the screen size or aspect ratio we are on, the image fills the screen cleanly, is always centered and retains its proper shape. And that's it for the image loading and rendering setup. We have now got all frames preloaded, a drawing function that renders the current frame and clean responsive way to show the animation on any screen.

**16:16** · In the next part, we'll connect this to scroll behavior using scroll trigger and make everything animate as the user scrolls. So now let's hook everything up to scroll using scroll trigger. I'll create a new scroll triggered animation that connects the entire hero section to the scroll behavior. First I'll tell scroll trigger which element to use as the trigger. In this case the hero section. That means the animation will begin as soon as this section reaches the top of the viewport.

**16:42** · Then I'll define the start and end points of the scroll animation. I am starting it right when the hero hits the top of the screen. And I'm extending the animation over a length that's seven times the height of the screen. This gives us plenty of scroll distance to animate through all of our frames smoothly. Next, I'll pin the section in place during the scroll range. This means the hero section will stay fixed while we scroll through the animation, creating a more immersive effect. I'm also enabling pin spacing to make sure the rest of the content below flows naturally once the animation ends. After that, I'll enable scrubbing.

**17:12** · What this does is directly tie the animation progress to the scroll position. So instead of playing like a timeline, it moves in perfect sync with how fast or slow the user scrolls. Now comes the most important part, the scroll update.

**17:25** · Every time the user scrolls, this update function runs. Inside it, I'll calculate how far we are into the scroll. This gives us a progress value that starts at zero and ends at one depending on how far we scrolled through the animation range. Then I'll calculate how far we are through the actual framed animation.

**17:41** · Since I want all the frame transitions to finish a bit before the scroll ends, I'll limit the progress to 90% of the scroll distance. This gives us some breathing room at the end for the unpin transition to kick in. Using the adjusted value, I'll figure out which frame number we should be showing. So, as the user scrolls, the calculation picks the right image frame from our list and we update the frame index in real time. Right after that, I'll call our render function again, which redraws the canvas using the updated frame, giving us that smooth frame by frame video playback.

**18:11** · And just like that, the canvas animation is now fully tied to scroll.

**18:20** · Now, let's finish setting up the scroll-based animation by adding some motion to the rest of the elements on the screen. We'll start with the navigation bar. At the beginning of the scroll, just in the first 10%, I'll gradually fade the nav bar out. To do that, I'll calculate how far we are through that first part of the scroll and then reduce the nav's opacity from fully visible to fully transparent as we move forward. This creates a subtle but clean exit for the nav bar. Once we scroll past that point, I'll keep the nav hidden completely. There is no need to animate it further. We are done with it for now.

**18:50** · Next, I'll animate the hero header which includes the main title and the trusted by label for the first quarter of the scroll about 25% of the total range. I want this entire block of content to move backward in 3D space.

**19:04** · So, as the scroll progresses, I'll push the header away from the screen along the Z-axis, making it feel like it's receding into the distance. This adds a cinematic feel to the animation and introduces some depth to the experience.

**19:18** · But I don't want the header to just float away. I also want it to fade out while it moves. So, as we approach 20% of the scroll, I'll start lowering the header's opacity. Between 20 and 25% the text fades out completely while still moving backward. Once that range is over, I'll keep the header fully hidden for the rest of the scroll. Now, let's move on to the dashboard image. The large graphic that appears in the second half of the scroll at the start of the animation. This image is completely invisible and positioned far in front of the screen in 3D space.

**19:49** · We don't want it to be visible at all until the right moment. I'll start animating it in once we hit the 60% mark of the scroll.

**19:58** · Between 60 and 90%, I'll gradually move the image backwards, bringing it from a far away 3D position into its final natural place on the screen. At the same time, I'll fade it in smoothly. During the first part of that range between 60 and 80%, I'll slowly raise the opacity from 0 to 1. And from 80 to 90%, I'll keep the opacity fixed at full while still finishing up the last bit of the Zdepth animation. This double motion depth and fade makes the dashboard appear as if it's emerging into focus from the background.

**20:28** · And once we pass 90% of the scroll, I'll lock the image in place at full visibility with no more movement or transition. Now, finally, I'll add one more small but important piece, a resize handler to keep things responsive. If the user resizes the browser window, I'll run our canvas setup function again to make sure the canvas always fills the screen. Right after that, I'll rerender the current frame and refresh scroll trigger. This keeps all the scroll animations perfectly aligned and prevents any visual glitches on different screen sizes. And with that, the scroll animation is complete.

**21:00** · Hope you found the video helpful. See you in the next one.