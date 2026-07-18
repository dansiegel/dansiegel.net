---
title: "The Hamburger Menu with Prism Forms"
description: "How many times have you heard someone ask about a Hamburger menu in Xamarin Forms? It's a topic that comes up fairly frequently and it seems there are two..."
publishedAt: "2017-04-01T13:00:00.000Z"
updatedAt: "2017-05-09T19:48:25.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin Forms","Prism","C#","XAML"]
legacyUrl: "/post/2017/04/01/the-hamburger-menu-with-prism-forms"
draft: false
---
How many times have you heard someone ask about a Hamburger menu in Xamarin Forms? It's a topic that comes up fairly frequently and it seems there are two distinct camps. Those who will tell you it's drop dead simple, and those who are stuck trying to figure out why if it's so simple, they can't figure it out. Honestly there are already a ton of YouTube videos and Blog Posts on the topic, so much so that I didn't want to touch the subject. However there is still a ton of confusion about the "Secret Sauce".

I would like to think the reality is somewhere in between. So often I find the major reason for these types of disagreement, has more to do with mis-managed expectations. For those stuck trying to figure out how to implement the Hamburger Menu, I think there are two key "gotcha's".

I've seen a number of blogs on the topic, but it seems like they're quick to say just use a `MasterDetailPage`. Ok you're done, you don't have to go home, but don't stay here. But that isn't the whole story. I've seen some blogs that do make more of a point to tell you that your Detail Page must be wrapped in a `NavigationPage`. But again, that just isn't the whole story.

So how on earth do you get that hamburger menu? Well for starters, you don't go to McDonalds (or for those in my neck of the woods, In N Out). When people ask about the "hamburger menu" they aren't asking how do you implement a slide out menu in your app. But that's what we keep telling people. In order to get the "hamburger menu", you need images. See people kept telling you it was easy. The secret sauce is to add an Icon to the `Master` page of the `MasterDetailPage`. Xamarin actually does this in their sample, but seems to gloss over the importance.

Since I'm a Prism guy though, let me go over the creation of a Prism App with a Hamburger Menu. I will assume you have the basic Prism App setup.

App.xaml.cs

```csharp
public partial class App : PrismApplication
{
    public App( IPlatformInitializer initializer = null )
        : base( initializer )
    {

    }

    protected override void OnInitialized()
    {
        InitializeComponent():
        NavigationService.NavigateAsync("MainPage/NavigationPage/ViewA");
    }

    protected override void RegisterTypes()
    {
        Container.RegisterTypeForNavigation<NavigationPage>();
        Container.RegisterTypeForNavigation<MainPage>();
        Container.RegisterTypeForNavigation<ViewA>();
        // So on and so forth...
    }
}
```

You'll notice here that there are three View's I'm registering. The first is just simply the Xamarin Forms NavigationPage. There's no magic here. The next is my MainPage, which I will go more into detail. And lastly I register ViewA which is just some View that I will have as a Detail Page.

  

MainPage.xaml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<MasterDetailPage
    xmlns="http://xamarin.com/schemas/2014/forms"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    x:Class="HamburgerMenu.Views.MainPage">
    <MasterDetailPage.Master>
        <!-- Hamburger Menu Secret Sauce... Add an Icon!!!! Make sure it's in your resources for your Platform Project -->
        <NavigationPage Title="Required Foo" Icon="hamburger.png">
            <x:Arguments>
                <ContentPage Title="Menu">
                    <StackLayout Padding="40">
                        <Label Text="{Binding UserName,StringFormat='Hello, {0}'}" />
                        <Button Text="View A" Command="{Binding NavigateCommand}" CommandParameter="Navigation/ViewA?message=Did%20you%20see%20the%20secret%20sauce%3F" />
                        <Button Text="View B" Command="{Binding NavigateCommand}" CommandParameter="Navigation/ViewB?message=Told%20you%20Prism%20Rocks%21%21%21" />
                        <Button Text="View C" Command="{Binding NavigateCommand}" CommandParameter="Navigation/ViewC?message=Does%20the%20hamburger%20make%20you%20hungry%3F%3F%3F" />
                    </StackLayout>
                </ContentPage>
            </x:Arguments>
        </NavigationPage>
    </MasterDetailPage.Master>
</MasterDetailPage>
```

All code means stuff, and there's a bit going on. Whether I'm coding or not, I'm generally a very light hearted kind of guy that likes to joke around. So you'll notice here the Navigation Page that I have as the `MasterDetailPage.Master`, has a title of "Required Foo". That is because Title is a required field for the Master, while the Icon is optional. The icon when supplied hides the title. I mentioned that a `NavigationPage` is a requirement for the "Hamburger Menu", but that is for the Detail, NOT the Master. I am choosing to use the NavigationPage in my Master in this sample, not because I expect actual navigation within the 'Menu', but rather because it quickly gives me the ability to add a nice Header and Toolbar Menu Items.

  

Now before you go all crazy trying to figure it out. You can download this [zip](/downloads/Hamburger.zip) for the Hamburger Icon assets for Android and iOS.
