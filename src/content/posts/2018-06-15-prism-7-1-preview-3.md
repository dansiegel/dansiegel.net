---
title: "Prism 7.1 Preview 3"
description: "Today we released the 3rd Preview for Prism 7.1. This is a very significant release for us and contains some very exciting changes. Forms Dependency Resolver At..."
publishedAt: "2018-06-15T07:39:00.000Z"
updatedAt: "2018-06-15T18:40:53.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin Forms","Prism","WPF","Modularity"]
legacyUrl: "/post/2018/06/15/prism-7-1-preview-3"
draft: false
---
Today we released the 3rd Preview for Prism 7.1. This is a very significant release for us and contains some very exciting changes.

### Forms Dependency Resolver

At Build we released a special preview for Xamarin Forms. In that preview we released the much awaited ability to use your Application's DI Container to resolve types inside of Xamarin Forms such as your Renderers or Platform Effects. It was a great feature but there were some issues caused on Android by the transition from a default constructor to one that requires the Android Context. Preview 3 fixes this by adding a specific Android target to each of the DI packages to handle passing the Context to the Container while resolving your Renderers.

We asked the community and while people were very torn on the subject, it was very overwhelming that using the DependencyResolver is something that should be configurable. As a result we've updated PrismApplication's constructor to accommodate this. First we removed the optional parameter for IPlatformInitializer and simply provided both a Default constructor and one that takes IPlatformInitializer. Second we added a new constructor that takes both IPlatformInitializer and a boolean to control whether we should set the DependencyResolver. As you may have guessed both of backwards compatible constructors call the new constructor, and by default will pass `false` to prevent PrismApplication from setting the DependencyResolver. 

Just as with Preview 2, you can still override `SetDependencyResolver` in order to provide your own logic.

#### Known Issues

FFImageLoading is a very popular image handling library. Unfortunately the CachedImageRenderer as 2 completely unnecessary constructors as they will never be used by Xamarin Forms and they only serve to confuse a DI Container. By default most DI containers will attempt to resolve a type based on the constructor with the most arguments. In the event that more than one constructor exists with the same "Highest" argument count, it will select the first one. This is the case in the CachedImageRenderer which results in the container attempting to resolve the Renderer with `CachedImageRenderer(IntPtr, JniHandleOwnership)`.

In order to handle this you will need to add a specific registration for the Renderer in your Android Initializer. This will look different based on which container you are using. If you're using DryIoc, you can easily add either of the following examples to fix the issue:

```csharp
public class AndroidInitializer : IPlatformInitializer
{
    public void RegisterTypes(IContainerRegistry containerRegistry)
    {
        containerRegistry.GetContainer().Register<CachedImageRenderer>(made: Made.Of(() => new CachedImageRenderer(Arg.Of<Android.Content.Context>())));
        // OR with Reflection
        containerRegistry.GetContainer().Register<CachedImageRenderer>(made: Made.Of(typeof(CachedImageRenderer).GetConstructor(new[] { typeof(Android.Content.Context) })));
    }
}
```

### Modularity

Modularity has been on my personal hit list for a while now, and Preview 3 makes some major changes to help accomplish the final goal of aligning the Modularity API between WPF and Xamarin.Forms as well as making it available for UWP. To start with we've moved the Modularity Exceptions from WPF to Prism.Core, along with ModuleInfo, IModuleInitializer, and IModuleManager. Among the changes, this means that Xamarin.Forms apps will be able to listen for the ModuleLoaded event and capture any exceptions that may occur during the Module's Initialization. 

For WPF developers defining their ModuleCatalog in XAML this means a break as ModuleInfo is now in Prism.Core. Rest assured though that some care has been taken to ensure that any API changes are addative and beneficial. An example of this is that the constructor's from Prism.Form's version of ModuleInfo were added to ModuleInfo in Prism.Core. For Prism.Forms developer's a bigger break in ModuleInfo was introduced by changing ModuleType from `Type` to `string`. While I say bigger break, this should only affect developers who are directly referencing ModuleInfo's ModuleType property. Since the Modularity API in Prism.Forms favor's generics this should have a minimal impact for most developers.

### XAML Navigation

Yep, I said it... This was an amazing idea and PR that came from the community. Over the past week I've had a chance to dogfood this one, and I have high hopes for what this will empower developers to do. Up until now you would need to have a ViewModel, inject the NavigationService, create a command, and an action for the command that uses the NavigationService to navigate to some other page, and then bind that command to some Button. Now with XAML Navigation you can simply have:

```xml
<Button Text="Continue"
              Command="{prism:NavigateTo ViewB}" />
```

Just as an example this could be used to completely eliminate a ViewModel on a Page that is simply a landing page that simply prompts the user to continue. This could be very useful for pages used in OnBoarding new users where you are explaining how to do something in your app. There is full documentation on this feature in the [Prism Docs](https://prismlibrary.github.io/docs/). Be sure to read more there on how to use NavigationParameters which would again make it easier to handle scenarios where you are try to Navigate based on a Cell in a ListView or a RepeaterView that so many of us have implemented.

### Additional Notes

Perhaps one of the first things that developers have had to learn with Prism.Forms is that you must name INavigationService 'navigationService' in your constructor otherwise it won't be injected into your ViewModel. While that hasn't been the case in DryIoc for a while, this is now a thing of the past for Autofac and Unity as well. 

While you may not have heard of this one before, SourceLink is an amazing new tool for OSS libraries to empower developers debugging experience. Sadly this only works in Visual Studio on Windows and is only in the Backlog for Mac for now, but for those working in Visual Studio 2017 this will let you step into Prism's code while you debug. 

Last but certainly not least. A few months ago Oren Novotny began talking to me about signing NuGet packages. After hearing what he had to say, I had to agree wholeheartedly that it was something we should do for our user base. Beginning with Preview 3, we are now signing each NuGet package as part of our release pipeline. This means that when you consume our packages you will be able to verify that the package actually comes from the Prism team and has not been altered between us and you.

Be sure to try out the new Prism 7.1 preview today and let us know what you think. Be sure there is more great stuff to come.
