---
title: "Prism 9.0 Preview 1"
description: "Ok I know I might start sounding like Tim Cook \"This is the biggest release yet\". But seriously, Prism 9.0 just may be the biggest release the Prism team has..."
publishedAt: "2023-10-07T09:36:00.000Z"
updatedAt: "2023-10-07T09:10:45.000Z"
categories: [".NET",".NET MAUI","Prism"]
tags: []
legacyUrl: "/post/2023/10/07/prism-9-0-preview-1"
draft: false
---
Ok I know I might start sounding like Tim Cook "This is the biggest release yet". But seriously, Prism 9.0 just may be the biggest release the Prism team has done to date. Despite some people claiming Prism is dead because there wasn't a recent release, the fact is we were hard at work on this release. Prism 9.0 is the sum of 2 years of work and I think you're going to really like some of the changes. It grew to a point for many reasons that meant there would be no 8.2 and instead we had to bump to 9.0. So what is so different in this release?  
  

## The License

Ok this may not quite fall under the category of we were super hard at work. But at the same time it actually kind of does. The license has changed from previous versions of Prism. First and foremost I'd like to address the ".NET Foundation issue". Both Brian and I love the idea of the .NET Foundation. We have always been big believers in it's initial vision and goals. Over the years though we simply realized that the vision of the .NET Foundation and it's actual practices (where it's really going) are two very different places. We believe in Open Source Sustainability, and fostering healthy relationships of trust between maintainers and the .NET Community. Unfortunately for a number of reasons we felt it was time to leave. 

As I mentioned, we believe in Open Source sustainability. As you may be aware Brian and I were also early adopters of the GitHub Sponsors program and have tried for the last several years to build a sustainability model around Prism with it. GitHub Sponsors had amazing promise, unfortunately it just isn't something that is working. After years of going back and forth on this issue, we have finally decided to change the license to a Dual License model. If you are familiar with the Community License program that is available from Syncfusion then you will already feel at home with what we are doing. If you qualify for the Community License you do not need to sign up for anything and you can continue to use Prism for personal or commercial purposes completely for Free! For more information on the licenses please visit [prismlibrary.com](https://prismlibrary.com/).

## One API To Rule them All

Prism 9.0 represents a major shift for us moving forward. In the past we had Regions, and Modularity duplicated in WPF and Xamarin.Forms. Then of course we introduced Dialogs and duplicated these as well. To make it more fun we added support for Uno Platform and you had the community project for Prism.Avalonia each with their own interface definitions for what these APIs should look like and going from one to another you ultimately had some small breaks in the API. While we had actually moved the Modularity interfaces to Prism.Core in Prism 7.1, Dialogs and Regions have now moved to Prism.Core as well. This means for the first time you can write ViewModels for your Dialogs or Regions and reuse them from your WPF application to your .NET MAUI application or even your Uno Platform application. We believe this will greatly empower some amazing scenarios for developers who may want to reuse legacy code from their WPF applications and bring it forward to mobile platforms.

Note that this also represents a break in namespaces as we are now sharing the NavigationParameters between Xamarin.Forms/.NET MAUI Page Navigation and Region Navigation. We have also moved the IDialogService to a new namespace as well.

Also well worth noting is that the IEventAggregator has been moved into a separate package which is now referenced by Prism.Core. This will enable people to make use of the IEventAggregator even outside of a Prism Application. Similarly we have moved our Dependency Container abstractions out of the Prism repo to a new private repo where the containers are maintained. This results in better sharing of DI Containers between platforms because they are now implemented independent from the platform meaning if you need specific container access without adding a framework dependency on WPF or .NET MAUI, etc... you now have this ability. This move also gave us the space to provide support for 2 new Dependency Injection Containers which will be available to Commercial Plus license holders ONLY.

\- Microsoft.Extensions.DependencyInjection  
\- Grace

## .NET MAUI

Prism 9.0 represents the first real release to support .NET MAUI. I know many people have wanted to see this a lot sooner, but truth be told .NET MAUI just wasn't production ready prior to .NET 8. With .NET 8 we finally got some of the API updates that we needed to properly support .NET MAUI and I think you are going to like it. For those who haven't yet had a chance to play with the earlier previews, Prism.Maui represents a change in paradigm where you no longer have a PrismBootstrapper or PrismApplication. We met the MAUI API where it made the most sense, with the MauiAppBuilder. This means that the flow is natural and you get a PrismAppBuilder with a fluent API that just makes sense. This also brings a number of changes to the table including a new NavigationBuilder that gives you more power and flexibility in creating your Page Navigation Uri's and even adds support for ViewModel navigation.

## Uno Platform

This release adds support for Uno Extensions out of the box targeting the latest stable release of Uno Platform.
