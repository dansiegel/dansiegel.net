---
title: "Xamarin Forms UI Development Made Easy with LiveXAML"
description: "I'm all about working with XAML in my Xamarin Forms apps. Developers coming from a WPF background have been used to some great tooling for visually styling their..."
publishedAt: "2017-10-10T02:00:00.000Z"
updatedAt: "2017-10-10T08:55:14.000Z"
categories: ["Xamarin"]
tags: ["Xamarin Forms","XAML","LiveXaml"]
legacyUrl: "/post/2017/10/10/xamarin-forms-ui-development-made-easy-with-livexaml"
heroImage: "/images/blog/xamarin-forms-ui-development-made-easy-with-livexaml/01-image.gif"
draft: false
---
I'm all about working with XAML in my Xamarin Forms apps. Developers coming from a WPF background have been used to some great tooling for visually styling their XAML for years. Xamarin Forms of course isn't so cut and dry for the obvious reason that we're dealing with an Abstraction of the UI. Chances are you've probably heard about Xamarin's Live Player. To be honest I think it's a cute idea, but really lacks what you need to be most productive. 

Naturally one of the biggest pains when working with XAML is getting the Styling just right. We do have more tools now at our disposal like the XAML Previewer in Visual Studio and Visual Studio Mac, but it lacks the touch and feel component of styling. This is where LiveXAML is making a huge difference in developing Xamarin Forms applications. LiveXAML not to be confused with Xamarin's Live Player, allows you to get the updates directly in your actual app. LiveXAML is truly one of the most amazing products I've ever worked with for XAML. 

![Xamarin Forms UI Development Made Easy with LiveXAML](/images/blog/xamarin-forms-ui-development-made-easy-with-livexaml/01-image.gif)

It really is as simple as installing a single NuGet package and running the application in your Simulator or on your Device. Now you can actually see what your changes are doing, without rebuilding, in an app that is fully functional. There are no short cuts, no limitations like we see with the Live Player or the Previewer.

There are a number of challenges that are hard to handle without a data context behind them. One of them is handling a ListView with a DataTemplateSelector. It's certainly one thing to refine a single ViewCell, but when you have multiple cells that each need to be styled there is no substitute for having real working data which can only happen with your app actually running. This is one the many scenarios where using LiveXAML can really shine as you quickly update the styling and see the changes in your app. 

If you haven't had a chance to check it out head over to [http://livexaml.com](http://livexaml.com/).
