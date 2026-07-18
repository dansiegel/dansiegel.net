---
title: "Prism 7.0 for Xamarin Forms Sneak Peek"
description: "Prism 7.0 Sneak Peek If you're a Xamarin developer, chances are you've been through a struggle or two with NetStandard. NetStandard offers a lot of advantages,..."
publishedAt: "2017-07-19T04:00:00.000Z"
updatedAt: "2017-07-20T07:48:50.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin","Prism","netstandard"]
legacyUrl: "/post/2017/07/19/prism-7-0-for-xamarin-forms-sneak-peek"
heroImage: "/images/blog/prism-7-0-for-xamarin-forms-sneak-peek/01-image.webp"
draft: false
---
If you're a Xamarin developer, chances are you've been through a struggle or two with NetStandard. NetStandard offers a lot of advantages, but support has been slow going in many cases. Xamarin Forms only recently began shipping NetStandard. Prism users have been asking for a while now to have NetStandard support. Obviously for WPF users NetStandard really doesn't offer any advantages, and for UWP it just creates a few headaches, but that hasn't stopped requests for the Core to support NetStandard or for Prism Forms to be converted. For a while now I've been either pointing people to my preview templates or telling them to use the PackageTargetFallback attribute with the new csproj format. Well, I'm happy to say that Prism for Xamarin Forms is now available in NetStandard!

![Prism 7.0 for Xamarin Forms Sneak Peek](/images/blog/prism-7-0-for-xamarin-forms-sneak-peek/01-image.webp)

While NetStandard support is fantastic, I probably wouldn't take the time to write a post just about that. One of the problems we all face is when we run into an issue with a library in our code base, and the issue is fixed on GitHub. The problem is that it may be days, weeks, even months before it is available. So suddenly you have to uninstall the NuGet packages, add the open source library as a git submodule. As Prism moves into the 7.0 update, I'm also very happy to announce the official Prism MyGet feed that is tied into the builds so when new features are added you can immediately expect a new CI package available on MyGet so you can immediately start using the features you need without having to wait for an official release. 

```bash
https://www.myget.org/F/prism/api/v3/index.json
```

## Whats New Since 6.3

You may be thinking that NetStandard is great and all but that isn't really new. As part of Prism updating to Xamarin Forms 2.3.5, you will now have full support for working with Prism on macOS applications. 

Another change you can look for starting now in the 7.0 addresses the overhauled OnPlatform starting in Xamarin Forms 2.3.4. Unfortunately the new Xamarin API for OnPlatform uses magic strings, and is cumbersome to say the least if you're working with it from C# code and not in XAML. Prism has updated the IDeviceService and provided a new RuntimePlatform enum. We have also updated Platform dependent View Registrations to use this new RuntimePlatform enum. This will ultimately be a lot cleaner than the previous type based registrations.

```csharp
Container.RegisterTypeForNavigationOnPlatform<MainPage, MainPageViewModel>("Main",
     new Platform<MainPage_Android>(RuntimePlatform.Android),
     new Platform<MainPage_iOS>(RuntimePlatform.iOS));
```

Following the deprecation of the previous OnPlatform functions within the Xamarin Forms Device class, we have updated `IDevice` to deprecate this feature as well and added access both the Xamarin Forms Platform string and our RuntimePlatform enum.

I have been a huge advocate for directly binding to your model's properties. It really saves a lot of headaches with validation and ensuring that changes made on the view update your model to be persisted to your data store. That said even with Prism's DelegateCommand.ObservesProperty, this has been a shortcoming. Thanks to a community contribution this will now be possible in Prism 7.0

```csharp
ObservesProperty(() => Property.NestedProperty.NestedPoperty)
```

Another major improvement addresses exceptions thrown during navigation. Prism Forms will now properly log and re-throw exceptions that are thrown when you're navigating. This has been a major pain point in the past where the exceptions were effectively swallowed by the NavigationService and you had no idea what threw an exception or even what the exception was. Many times you might have simply found yourself getting an exception thrown because your MainPage was null and the platform excepted something. 

There have also been a number of reported Navigation Bugs fixed in Prism 7.

### Prism for UWP Developers

If you're developing UWP applications with Prism there are a couple of gotcha's that you'll need to know about. 

Starting in Prism 7.0 we've decided to split all of the Platforms/Containers into separate packages. We've done this so that we can rev the platforms separately from one another, and if we update an issue with `Prism.Autofac.Wpf`, `Prism.Autofac.Windows` user's won't see a package update and think that something changed. This only affects UWP developers who are using Prism for UWP. You simply need to uninstall the `Prism.{Container}` package and install the `Prism.{Container}.Windows` package. (note that this update is not yet available but will be soon)

Whether you're using Prism for UWP or Prism for Xamarin Forms, note that there is a bug with the .NET SDK that will affect you if Prism 7 is the first NetStandard package that you are using. It is easily overcome by adding the file `Directory.Build.props` next to your solution file, with the following contents:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project>
  <!-- Workaround for https://github.com/dotnet/sdk/pull/908 -->
  <Target Name="GetPackagingOutputs" />
</Project>
```

Note that if you are developing a UWP application with the Prism QuickStart Template for Xamarin Forms, this has already been added for you.

## Whats Coming

As amazing as NetStandard is to finally have behind us, I'm still even more excited by what's coming in 7.0. I wouldn't call this an exhaustive list, but here are some highlights of some features to keep an eye out for in Prism 7:

-   Querystring navigation is one of the most amazing things about the Prism Navigation Service, and it's about time that you should be able to dynamically create tabs or use modal navigation through the querystring.
-   Removal of support for the Xamarin Forms DependencyService. This really leads to some bad practices, and with `IPlatformInitializer` there is simply no need to rely on the Dependency Service for Platform specific types.
-   An ability to use MVVM and the ViewModelLocator with custom Views as well as Xamarin Forms Pages.
