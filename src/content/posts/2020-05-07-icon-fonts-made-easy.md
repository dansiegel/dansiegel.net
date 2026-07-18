---
title: "Icon Fonts made Easy"
description: "Coming from a Pre-Xamarin background of web development, I have always loved fonts like Font Awesome. Naturally I was pretty excited that Xamarin.Forms finally..."
publishedAt: "2020-05-07T01:00:00.000Z"
updatedAt: "2020-05-07T08:22:29.000Z"
categories: ["Xamarin"]
tags: ["Xamarin Forms","XAML","font awesome","icons","embedded fonts"]
legacyUrl: "/post/2020/05/07/icon-fonts-made-easy"
heroImage: "/images/blog/icon-fonts-made-easy/01-image.webp"
draft: false
---
Coming from a Pre-Xamarin background of web development, I have always loved fonts like Font Awesome. Naturally I was pretty excited that Xamarin.Forms finally added a FontImageSource to make it easier to use Font based Icons, but it still frankly was a pain to use. 

## Why Out of Box Is Terrible

Ok this might sound a little harsh, but to be honest even the geekiest among us don't go around memorizing and quoting unicode characters, so if you want to be able to use your custom icons you almost certainly need to create some sort of Mapping class.

```csharp
public static class FontAwesomeBrands
{
    public const string FontFamily = "fa-brands-400.ttf";

    public const string TwitterSquare = "\uf081";
    public const string FacebookSquare = "\uf082";
    public const string Linkedin = "\uf08c";
}
```

Now this is a little better because at least now we have made it human readable for which icon we're using and which font we've used... but it's still pretty verbose...

```xml
<Label Text="{x:Static fonts:FontAwesomeBrands.TwitterSquare}" />
```

Of course this probably also dismisses the fact that all we want to do is set the text to our icon here, but we also had to specify the FontFamily. While there are several common approaches here we'll just say it might look like this:

```xml
<Label Text="{x:Static fonts:FontAwesomeBrands.TwitterSquare}"
       FontFamily="{x:Static fonts:FontAwesomeBrands.FontFamily}" />
```

## Hitting that Easy Button

Luckily there's a new package in town that aims to help simplify this allowing you to cut down on the complexity. Built on top of the Embedded Fonts introduced in Xamarin.Forms 4.5, the AP.MobileToolkit.Forms.Fonts, not only has a long package name, but helps package and consume icon fonts. Currently in preview it ships with packages for Font Awesome Free. 

![Icon Fonts made Easy](/images/blog/icon-fonts-made-easy/01-image.webp)

To get started with Font Awesome all you need to do is install any of the Font Awesome packages and register the Font with the Font Registry in your Application.

```csharp
public partial class App
{
    public App()
    {
        FontRegistry.RegisterFonts(
            FontAwesomeRegular.Font,
            FontAwesomeSolid.Font,
        );
    }
}
```

With that little bit of code your application is now ready to use either font. Now you just need to consume it. With the Icon XAML extension it really couldn't be easier. Naturally we'll want to figure out which icon we want to use, just as if we weren't using Xamarin.

![Icon Fonts made Easy](/images/blog/icon-fonts-made-easy/02-image.webp)

If we do a quick search on the Font Awesome website we'll get something like this. Since we love how easy it is to use this we'll use the grin-hearts icon to reflect it. 

![Icon Fonts made Easy](/images/blog/icon-fonts-made-easy/03-image.webp)

Of course when we look at our icon we can see the unicode, but that isn't overly helpful or readable... but if we look at the classes that are used on the web this helps us easily identify that it's the Grin-Hearts icon in Font Awesome Regular, so we'll use this with the Toolkit's Icon extension.

```xml
<ContentPage xmlns="http://xamarin.com/schemas/2014/forms"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:ap="http://avantipoint.com/mobiletoolkit"
             x:Class="DemoFonts.MainPage">
    <Label Text="{ap:Icon 'far fa-grin-hearts'}" />
</ContentPage>
```

Ok now I know some of you may be thinking this looks great except this is still a magic string. Well the AP.MobileToolkit has you covered there as well so you could alternatively do:

```xml
<ContentPage xmlns="http://xamarin.com/schemas/2014/forms"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:ap="http://avantipoint.com/mobiletoolkit"
             x:Class="DemoFonts.MainPage">
    <Label Text="{ap:Icon {x:Static ap:FontAwesomeRegular.GrinHearts}}" />
</ContentPage>
```

![Icon Fonts made Easy](/images/blog/icon-fonts-made-easy/04-image.webp)

Just like that we have a working custom font, installed via NuGet. It took a very simple line of code to setup in our App and then we were free to easily use it throughout our app.

## Next Steps

-   Install it from NuGet.org
-   Be sure to [give it a Star on GitHub](https://github.com/AvantiPoint/AP.MobileToolkit.Fonts "give it a Star on GitHub")
