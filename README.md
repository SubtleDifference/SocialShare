# Social Share

Social Share is a lightweight and customizable social sharing solution for your website. Easily add social sharing icons with various display modes and styles.

## Features

- Floating and inline display modes
- Support for popular social media platforms
- Customizable themes and styles
- Easy to generate custom HTML code
- Compatible with Font Awesome, Bootstrap Icons, and Boxicons

## Getting Started

To use Social Share, include the following CSS and JS files in your project:

```html
<link rel="stylesheet" href="socialshare.min.css">
<script src="socialshare.min.js"></script>
```

### Display Modes

Social Share supports the following display modes:

- `fixedsocials`: Floating icons on the left side of the page or in the footer for smaller screens
- `inlinesocials`: Inline icons that can be placed anywhere on the page

### Icon Styles

Choose from the following icon styles for your Social Share icons:

- Font Awesome (`fa`)
- Bootstrap Icons (`bi`)
- Boxicons (`bx`)

Include the relevant CDN script in your HTML file based on your chosen icon style.

### Themes

Social Share supports a default theme and a custom theme. To use the custom theme, add the `customtheme` class to your `nav` element.

### Usage

Here's an example of how to use Social Share on your website:

```html
<!-- Include the necessary CSS and JS files -->
<link rel="stylesheet" href="socialshare.min.css">
<script src="socialshare.min.js"></script>


<!-- Add the social share icons with the desired display mode, icon style, and theme -->
<nav class="socialshare inlinesocials customtheme">
    <ul class="social-icons">
        <!-- Add your social icons here -->
    </ul>
</nav>
```

### Example

For a complete example, including various display modes, themes, and icon styles, check out our [example.html](./example.html) file.

### Customization

You can easily customize Social Share to fit the look and feel of your website by modifying the CSS file or by creating your own custom theme.

To create a custom theme:

1. Add the `customtheme` class to your `nav` element.
2. Define your custom styles in your CSS file for the `.socialshare.customtheme` selector.

For example:

```css
.socialshare.customtheme {
    /* Add your custom styles here */
}
```

### Generate Your Own HTML

To generate custom HTML for your Social Share icons, use our online generator:

[Social Share Generator](https://subtledifference.com.au/social-share-generator)


### Contributing

We welcome contributions to improve and expand the Social Share project. If you have ideas or suggestions, please submit a pull request or open an issue on GitHub.

### Support

If you encounter any issues or need assistance, please open an issue on our GitHub repository:

[Social Share Issues](https://github.com/SubtleDifference/SocialShare/issues)

### License

This project is licensed under the MIT License. For more information, see the [LICENSE](./LICENSE) file.


