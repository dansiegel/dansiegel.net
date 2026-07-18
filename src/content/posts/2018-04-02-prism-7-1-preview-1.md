---
title: "Prism 7.1 Preview 1"
description: "Maintaining a library can be exceptionally difficult. As time progresses new demands arise that weren't there when the API was first created. Sometimes simple..."
publishedAt: "2018-04-02T04:40:00.000Z"
updatedAt: "2018-04-02T12:40:19.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin Forms","Prism","WPF"]
legacyUrl: "/post/2018/04/02/prism-7-1-preview-1"
draft: false
---
Maintaining a library can be exceptionally difficult. As time progresses new demands arise that weren't there when the API was first created. Sometimes simple work arounds can be found to prevent breaking library consumers when they upgrade. Sometimes the changes are no brainers that have no negative affects. Sometimes changes simply aren't made because the potential breaks are simply too risky. Other times the benefits simply outweigh the break and changes are made.

Prism 7.1 is largely the result of changes that the Prism Team has come to realize had to be made. As part of the overall Prism 7.X effort, the team has been working on bringing the API closer together across each platform target where possible. Currently this is perhaps most evident with the introduction of the Prism.Ioc namespace allowing developers to more easily port from one DI Container to another, and even create Prism Modules that are sharable across projects with different DI Containers.

In this release have made some major changes to better unify the API between Xamarin Forms and our ongoing work with Jerry Nixon to bring Template 10 to Prism for UWP. This effort though represented the need to create a binary incompatibility, a need to create some breaking changes, and an opportunity to greatly improve the API for Xamarin Forms developers. So what are the changes? For starters we've migrated most of the Prism.Navigation namespace from Prism.Forms to Prism.Core. After a lot of deliberation we ultimately decided that these changes should not be available to WPF developers as it just doesn't make sense for WPF applications. 

In addition to the binary incompatibility caused by moving the classes from one binary to another, this creates a secondary break in the WPF will NOT be supported for Xamarin Forms developers.

I mentioned that there are breaking changes and some opportunities for improvements as well. The break that you will encounter should be fixable with a simple Find/Replace in your IDE or text editor, as NavigationParameters is now INavigationParameters which changes the method signatures for INavigatingAware, INavigatedAware, INavigationAware, IConfirmNavigation, IConfirmNavigationAsync, and INavigationService. While that may provide you with some unique opportunities for testing, that isn't the exciting change. The change is the return type from INavigationService from a simple Task to Task<INavigationResult>. Why is that so great? Well for one thing if the Navigation failed for some reason you'll have access to a Boolean to more easily execute that logic. It's also great though because until now the NavigationService could make it harder to determine what type of exception may have been thrown. INavigationResult fixes this by returning the actual exception that was thrown allowing you greater control over what to do with it.

```csharp
var result = await _navigationService.NavigateAsync("BadPage");

if(!result.Success)
{
    await _pageDialogService.DisplayAlertAsync(result.Exception.GetType().Name, result.Exception.Message, "Ok");
}
```

Perhaps my single favorite improvement in Prism 7.1 for Xamarin Forms developers is the inclusion of the ContainerProvider. This was born out of a desire to be able to declare types such as a TypeConverter that may rely on some service in your application. The ContainerProvider will allow you to declare in XAML, types that do not have a default constructor and inject any of your applications services into that type. 

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<ContentPage
    xmlns="http://xamarin.com/schemas/2014/forms"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    xmlns:prism="clr-namespace:Prism.Ioc;assembly=Prism.Forms"
    xmlns:converters="using:Prism.Forms.Tests.Mocks.Converters"
    Title="{Binding Title}"
    x:Class="Prism.DI.Forms.Tests.Mocks.Views.XamlViewMock">
    <ContentPage.Resources>
        <ResourceDictionary>
            <prism:ContainerProvider x:TypeArguments="converters:MockValueConverter" x:Key="mockValueConverter" />
        </ResourceDictionary>
    </ContentPage.Resources>
    <Entry x:Name="testEntry"
           Text="{Binding Test,Converter={StaticResource mockValueConverter}}" />
</ContentPage>
```

### Unity

Unity has been one of the most popular containers for Prism Developers. I have no doubt that this has a lot to do with the fact that it is the container Brian has used for years, has used in his demos and that was most widely available in the Prism Template Pack. The Unity team has made some major design changes in Unity 5.X. For Prism developers using Unity we have long since had a dependency on the Unity NuGet package. In it's current state, this actually broke Prism.Unity.Forms for netstandard1.0. 

The Unity team has redefined the Unity NuGet package to be an all inclusive package that presents several problems. For Xamarin Forms developers, it introduces references to 6 more assemblies than what you actually need or would use. For WPF developers it creates a secondary, and hidden reference to CommonServiceLocator, as well as the inclusion of 5 more assemblies than what you need or Prism uses. To continue depending on this NuGet package represents an additional issue that it could continue to break Prism developers. To resolve this, Prism 7.1 has changed it's target from Unity to Unity.Container. This change will be unnoticeable to anyone who uses the new PackageReference to include NuGet's in their projects, particularly when you have your dependency on Prism.Unity or Prism.Unity.Forms and not Unity itself. For all other Unity developers, you should uninstall Unity from your projects before upgrading to Prism 7.1.
