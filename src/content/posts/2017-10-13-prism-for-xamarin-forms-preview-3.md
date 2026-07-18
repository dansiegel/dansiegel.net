---
title: "Prism for Xamarin Forms Preview 3"
description: "So much goes into developing a Xamarin Forms application, and Prism for Xamarin Forms is continuing to make your mobile development a little easier. Today we..."
publishedAt: "2017-10-13T05:53:00.000Z"
updatedAt: "2017-10-13T15:06:38.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin Forms","Prism"]
legacyUrl: "/post/2017/10/13/prism-for-xamarin-forms-preview-3"
draft: false
---
So much goes into developing a Xamarin Forms application, and Prism for Xamarin Forms is continuing to make your mobile development a little easier. Today we released Preview 3 for Prism 7, and a lot has happened since I published the [Sneak Peak](/post/2017/07/19/prism-7-0-for-xamarin-forms-sneak-peek) and the changes to [Autofac](/post/2017/08/02/breaking-changes-for-prism-autofac-users).

## Navigation

One of the big things developers love about Prism is Deep Linking like `"NavigationPage/ViewA/ViewB/ViewC"`. Unfortunately this also exposes a bug in Xamarin Forms which the Xamarin team hasn't fixed. The result has been that the Title displayed in the NavigationPage is for ViewA rather than ViewC. Prism 7 has finally fixed this issue so that deep linking can still occur properly.

A long awaited feature is Relative Navigation. We see this all the time in web development, and beginning with preview 3 you can now simplify our Navigation like "../SomePage". This will both pop the current page and add SomePage to the Navigation Stack. Keep in mind that this feature will only work within the context of a NavigationPage. 

Another long await feature has been the ability to simply go back to the root. Prism's Navigation Service now includes a GoBackToRootAsync extension that will support this exact use case. 

## TabbedPages

Prism 7 has a lot of fixes to make working with TabbedPages a joy. In past versions of Prism we've had to both explicitly set the `ViewModelLocator.AutowireViewModel` property on any pages that will be children of a TabbedPage, and we've had to create a TabbedPage that explicitly sets the tabs.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<TabbedPage xmlns="http://xamarin.com/schemas/2014/forms"
            xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
            xmlns:local="clr-namespace:AwesomeApp.Views;assembly=AwesomeApp"
            x:Class="AwesomeApp.Views.MyTabbedPage">

    <local:ViewA />
    <local:ViewB />
    <local:ViewC />

</TabbedPage>
```

Beginning with Prism 7 you can now simply register the Xamarin Forms TabbedPage for Navigation and simply navigate like `"TabbedPage?createTab=ViewA&createTab=ViewB&createTab=ViewC"`. But it doesn't stop there. There are times that we want to use a NavigationPage for a particular tab. We can now easily do this by adding the pipe character and navigating like: `"TabbedPage?createTab=ViewA&createTab=NavigationPage|ViewB&createTab=ViewC"`. Best of all is that the NavigationService now better handles the children so that whether you have a traditional TabbedPage like above or one generated from the querytstring your pages will be automatically get the `ViewModelLocator.AutowireViewModel` set, and any Prism Behaviors will also automatically be set.

There has also been a major breaking change for selecting the active tab. In previous versions of Prism for Xamarin Forms you could set the active tab by adding the tab to select as the next Uri segment `"MyTabbedPage/ViewB"`. This has been changed in preference of a querystring parameter like `"TabbedPage?selectedTab=ViewB"`. Note that for those who are concerned about magic strings, we've got you covered as this is all based on the constants in KnownNavigationParameters. Putting this all together you can now navigate like:

```csharp
_navigationService.NavigateAsync($"TabbedPage?{KnownNavigationParameters.CreateTab}=ViewA&{KnownNavigationParameters.CreateTab}=ViewB&{KnownNavigationParameters.CreateTab}=ViewC&{KnownNavigationParameters.SelectedTab}=ViewC");
```

## Lifecycle

`IActiveAware` has been around Prism for some time but has only had limited support to handle when a page becomes the current page inside of a TabbedPage or CarouselPage. A new interface has been added to Prism.Forms called IPageLifecycleAware. This is handled through a Behavior added to every page by the NavigationService which will allow you to respond to the Appearing and Disappearing events.

Sticking with being Lifecycle aware, preview 3 has introduced a breaking change from earlier previews with `IApplicationLifecycle` to `IApplicationLifecycleAware`. While there hasn't been any actual changes to the way it works, it does better fit the naming conventions in Prism.

## Modularity

Modularity has long been a core concept in Prism. Modularity has gotten a whole lot nicer in Prism 7 with a few fixes. To start with IModuleCatalog was fixed to properly return IModuleCatalog rather than ModuleCatalog when adding a Module. One of the problems with adding Modules in previous versions has been the verbosity that was required:

```csharp
ModuleCatalog.AddModule(new ModuleInfo(nameof(SomeModule), typeof(SomeModule), InitializationMode.WhenAvailable));
```

This can now be simplified like:

```csharp
// Basic Registration
ModuleCatalog.AddModule<SomeModule>();
```

There are of course some overloads to specify either the name or Initialization Mode. We have also added extensions to better determine whether a Module has been added to the ModuleCatalog and what the ModuleState is.
