---
title: "Making DevOps Easy with Mobile.BuildTools"
description: "It's been quite a journey if I'm honest. In fact as I look back over the last several years it's really crazy too look at what the Mobile.BuildTools has..."
publishedAt: "2021-07-07T08:59:00.000Z"
updatedAt: "2021-07-07T18:20:03.000Z"
categories: [".NET","Xamarin"]
tags: ["DevOps","Xamarin","Xamarin Forms",".NET","Mobile.BuildTools"]
legacyUrl: "/post/2021/07/07/making-devops-easy-with-mobile-buildtools"
heroImage: "/images/blog/making-devops-easy-with-mobile-buildtools/01-image.webp"
draft: false
---
It's been quite a journey if I'm honest. In fact as I look back over the last several years it's really crazy too look at what the Mobile.BuildTools has transformed into from it's humble origins as a collection of PowerShell scripts I was tired of rewriting every time I started a new app. The Mobile.BuildTools have continued to make developers lives easier with the last major release being exactly 3 years ago. Spoiler, the Mobile.BuildTools 2.0 does so much for you over what 1.x could do, I cannot hope to cover it all in a single blog post. It also means I had to put together a full docs site and json schemas for the configuration so that I could remember it all. If you haven't started using the Mobile.BuildTools yet, this package really is a must add for all of your Xamarin apps. While most of my followers know me for maintaining Prism, what you may not realize is that I also have a passion for proper DevOps. One of the beautiful things about the Mobile.BuildTools is that at the end of the day it just a collection of MSBuild Targets which means that everything that you do on your Local dev machine just works in CI without any special scripts or extensions to install into your Azure DevOps org, and it doesn't even matter which CI platform you want to use because it will just work! Of course before you ask, this is a build reference meaning that there are no extra assemblies getting added to your app bloating the compiled app size (unless you want app.config).

## What is in 2.0?

While Mobile.BuildTools 1.4 is awesome, truthfully there were a lot of processes that I still found to be a struggle, or at least more of a process than what they really needed to be. Perhaps one of the single greatest changes is that while the Mobile.BuildTools continues to be a collection of MSBuild extensions that make the build pipeline tailored to the DevOps processes that make your life easier whether you're building on your local machine or in CI, you don't need to understand anything about MSBuild, or csproj properties. With 2.0, you can now leverage a json first approach to configuring the Mobile.BuildTools.

![Making DevOps Easy with Mobile.BuildTools](/images/blog/making-devops-easy-with-mobile-buildtools/01-image.webp)

The Mobile.BuildTools 2.0 is a nearly complete rewrite from version 1.4, and while certain features could probably get their own dedicated blog posts I thought it might be good to give a brief introduction to some of the amazing features and how they can help you out.

## Application Settings

For those upgrading from 1.4, you're already familiar with the secrets.json and Secrets class generation. Over the years I've had a lot of discussions with developers using the Mobile.BuildTools and how they're using it. Obviously I've also had a lot of experience with my own projects and how I've needed to use the BuildTools to help my processes. It became apparent to me that this really needed a name change to more properly reflect how people use this class generation. There may be some client secrets that you want access to, but often times it's not super sensitive "secret" information like what scopes you're requesting from the OAuth provider, or the url for the mobile app service layer. 

As I hinted earlier the configuration is all done with json. When you install the Mobile.BuildTools it will generate a buildtools.json in your solution root. The default configuration will enable a bunch of things for you, however Application Settings will not be one of them out of the box. So let's take a look at how this works.

```js
{
  "$schema": "https://mobilebuildtools.com/schemas/v2/buildtools.schema.json",
  "appSettings": {
    "AwesomeApp": [
      {
        "properties": [
          {
            "name": "SampleProp",
            "type": "String"
          }
        ]
      }
    ]
  }
}
```

In the configuration we can establish 1 or more settings classes to be generated in 1 or more projects within our solution. There is a lot of great content further explaining how to configure this on the [docs site](https://mobilebuildtools.com/config/appsettings/configuration/ "Mobile.BuildTools Application Settings Configuration"). A distinct advantage that this provides is that you are now able to define what properties belong in a generated class, what the data type is, and circumvent the problems encountered on certain build hosts like Azure DevOps Windows agents which like to cast all environment variables ToUpper... Additionally because it's described here, this gives other developers that you may onboard a single place to go to to see what they will need to setup.

## The classic app.config

In the early days as I began prepping for the Mobile.BuildTools 2.0 I had a discussion with Chase Florell about some DevOps issues that he had been facing with his team at the time. To be honest it's not an uncommon issue. The issue was effectively there was an easter egg in the app where you tap 5 times, spin around on one leg, while whistling dixie... if you've been around building Xamarin apps for a while you may have seen or implemented this exact sort of thing. The easter egg was there to allow testing with production builds so that you could effectively take a build for QA and test against production, or take a production build from the store and make sure that it won't break against some Dev / QA version of the app's service layer. In this scenario an app.config makes a lot of sense to use, particularly when you have the ability to perform live transformations in the app. While there are some other very valid reasons to want to use app.config, whatever your reason, the Mobile.BuildTools 2.0 now makes this possible with it's own implementation of the ConfigurationManager. This is entirely interface based meaning that for those of you who love DI as much as I do, you'll be able to register the current instance with your container and work against the interface making it easier to test your code. To use this you will need to install the [Mobile.BuildTools.Configuration](https://www.nuget.org/packages/Mobile.BuildTools.Configuration/) package.

## Image Management

Ok a dirty little secret of Mobile app development... you will likely hate whenever someone says you need an image because you need about 40,000 different resolutions of that one \*\*\*\*\*\*\* image. Interestingly both [Jon Dick (@Redth)](https://github.com/redth) and I seemed to have gotten fed up with this and began pushing for a better user story on these features about the same time. While Resizetizer is fantastic and built into Maui, there are some issues that I still saw that could be a lot better. The first issue is that most developers I talk to share with me that they either just don't understand MSBuild properties at all or they feel intimidated editing a csproj file. This of course circles back to why I created a json configuration file to begin with. Again for an in depth look at what the Mobile.BuildTools can do for you, be sure to [checkout the docs](https://mobilebuildtools.com/images/). In short some highlights you get with the Mobile.BuildTools are:

-   Images do not need to live in any project
-   You can include one or more folders containing image assets
-   You can conditionally include images/image configurations based on the build Configuration or target platform (iOS/Android/UWP)
-   Supports JPEG, PNG, & SVG source images
-   Generate 1 or more output images. (handy for having thumbnail and full size versions)
-   Add a padding to any image (handy for those circle icons on Android)
-   Configure an image globally or have per platform overrides
-   Image source and target names do not need to match
-   You can add background colors to transparent source images (handy for those app icons)
-   You can add a watermark graphic to any image (they don't even need to be the same size, the Mobile.BuildTools will resize appropriately for you!)
-   You can add a custom text graphic to any image, with support for gradients, and full control over your colors and even what font you want to use (handy for having app icons with a banner like Dev, QA, or Lite, Pro, etc)

Below you'll see a sample of an image configuration for an app icon. When we build for iOS it will automatically pick up the AppIcon.appiconset, and generate all of the outputs defined in the json file for us. When we build for Android though it will generate 3 images for us. The first will be called icon and will be added as a mipmap resource. Next we'll get a launcher\_foreground image, which will have a padding on it so that it displays nicely as a round image. Finally we'll get a copy of our original icon, but called notifications and will be available as a drawable resource instead.

```js
{
  "$schema": "http://mobilebuildtools.com/schemas/v2/resourceDefinition.schema.json",
  "name": "AppIcon",
  "android": {
    "resourceType": "Mipmap",
    "name": "icon",
    "scale": 0.1875,
    "additionalOutputs": [
      {
        "name": "launcher_foreground",
        "resourceType": "Mipmap",
        "scale": 0.28125,
        "padFactor": 1.5
      },
      {
        "name": "notifications",
        "resourceType": "Drawable",
        "scale": 0.1875
      }
    ]
  }
}
```

## App Manifests

For your AndroidManifest.xml and Info.plist there are a couple of common issues I've always wished that could be easier. Luckily the Mobile.BuildTools makes it super simple now. By far the most common scenario every developer needs to address is App Versioning. Now with the Mobile.BuildTools you have a way to get your app to bump the version with every build. You can set this up to work only in CI environments, only outside of known build environments (your local machine), or everywhere. You can also set it up to use prefer a build number when available or use a timestamp. This means no extra build steps are required to bump the app version and no extensions like the [Mobile App Tasks from James Montemagno](https://marketplace.visualstudio.com/items?itemName=vs-publisher-473885.motz-mobile-buildtasks) for Azure DevOps. All you need to do is build and your app will automatically get a fresh app version!

App manifest manipulation doesn't always end there. There can be a variety of reasons why you might need to update values in your app manifest such as updating the app id based on the build environment (Dev, Stage, Prod). Other reasons could include scenarios where you're using Azure Active Directory B2C or similar OAuth library for user authentication and you either want to just make sure you're following good development practices by keeping the client id out of source control, or you need to specify different client id's based on build environment. Whatever your reason you can say goodbye to managing multiple copies of the manifest, or dealing with scripts and accidently checking in those changes to source control. The Mobile.BuildTools now allows you to tokenize your app manifest, and we will automatically search for and replace them based on values from your appsettings.json & environment variables. 

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android" android:versionCode="1" android:versionName="1.0" package="$AppId$">
	<uses-sdk android:minSdkVersion="21" android:targetSdkVersion="29" />
	<application android:label="$AppDisplayName$"></application>
	<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

For scenarios like this which clearly are not sensitive in nature the Mobile.BuildTools has another helpful feature in the config. You have the ability to define constants for the build environment which exist within the buildtools.json and will be used in the event that they do not exist in the system Environment or appsettings.json, and you can even have these be conditional just like with Images!

```js
{
  "$schema": "https://mobilebuildtools.com/schemas/v2/buildtools.schema.json",
  "environment": {
    "defaults": {
      "AppId": "com.avantipoint.buildtoolssample"
    },
    "configuration": {
      "Debug": {
        "AppId": "com.avantipoint.buildtoolssampledev"
      }
    }
  }
}
```

## Next Steps

Like I said there's a lot jammed packed into the Mobile.BuildTools, more than I could hope to go into depth on in a single blog post. It's designed to help simplify your DevOps processes by making it seamless between your local dev machine and CI build agent. Ultimately the best way to learn more is to get started by taking a look at the docs and adding the Mobile.BuildTools to your app.

-   [Mobile.BuildTools docs](https://mobilebuildtools.com/)
-   [Sample Apps](https://github.com/dansiegel/Mobile.BuildTools/tree/master/samples)
