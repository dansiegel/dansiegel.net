---
title: "AndroidX, App Bundle and Profiled AOT for Xamarin Android"
description: "Recently I tweeted about some early observations on some updates I made for an Android project that's currently in the App Store. What was so amazing about this..."
publishedAt: "2019-08-07T02:00:00.000Z"
updatedAt: "2019-08-07T11:24:33.000Z"
categories: ["Xamarin"]
tags: ["AOT","Xamarin","Android","AAB","AndroidX","AppCenter","Azure DevOps","Google Play"]
legacyUrl: "/post/2019/08/07/androidx-app-bundle-and-profiled-aot-for-xamarin-android"
draft: false
---
Recently I tweeted about some early observations on some updates I made for an Android project that's currently in the App Store. What was so amazing about this is that the App Bundle was showing a download size that was roughly around 18% of what the traditional APK per ABI would produce.

> On the top is a traditional Android app deployment with an APK per ABI. On the bottom is the same app updated using [#xamarinforms](https://twitter.com/hashtag/xamarinforms?src=hash&ref_src=twsrc%5Etfw) 4.1, [#prismlib](https://twitter.com/hashtag/prismlib?src=hash&ref_src=twsrc%5Etfw) 7.2, the new AAB, Profiled AOT, and migrated to use AndroidX… there is hardly any difference in download size... 🤣 [pic.twitter.com/FcII7SGXGG](https://t.co/FcII7SGXGG)
> 
> - Dan Siegel (@DanJSiegel) [August 5, 2019](https://twitter.com/DanJSiegel/status/1158419581913841670?ref_src=twsrc%5Etfw)

The truth is some of these numbers are a little misleading. For instance while Google shows a download size around 4.3 - 4.8MB, in practice I really am seeing around a 7MB download from Google Play. While it is about 50-60% larger than what I see the download should be from the Release Dashboard in Google Play, it's still only around 29% of the size of the existing stable release that customers are downloading right now. In some respects with Unlimited data being widely available in major markets like the US, and very large internal storage being available on most devices it's still very attractive to ship smaller app packages to customers. Surprisingly it's really not that difficult to update your project to use all of this, though the CI/CD gets a little trickier.

## Android App Bundle

I'm not going to go into detail about the Android App Bundle as I'm sure you can find plenty of other articles that will educate you more on what they are. For the purposes of this post I am simply going to define them as an optimization of a single APK that contains the necessary resources for all of your target ABI's. In the case of the app that I referenced in my Twitter post, the generated Android App Bundle was about 10MB which you may notice by itself was less than half the size of the existing APK size of the app in Google Play. So how do you update your Xamarin.Android project to start generating an .aab? Well for starters your build environment will need to be using Xamarin Android 9.4 or later. At the moment the hosted agents in Azure DevOps / App Center do not have that out of the box. 

It really couldn't be easier to generate the .aab though as you simply need to add a single property to the csproj for your Xamarin.Android project.

```xml
<PropertyGroup>
  <AndroidPackageFormat>aab</AndroidPackageFormat>
</PropertyGroup>
```

Note that while this snippet shows the `AndroidPackageFormat` property being declared in a root PropertyGroup (without conditions), you could put this in a PropertyGroup that is conditioned for Release or Store builds if you still want to generate an APK for Debug or Release and then ship an .aab to Google Play. It's also important to note here that before you can upload an .aab to Google Play you must delegate signing to Google. If you have not previously done so you will need to export your keystore with the private key from Android Studio so that you can upload it to Google and enable Android App Bundles for your app.

### Critical For Distribution

It is also worth noting here that as a gotcha when you version your builds the Version Name does not matter to Google. So if you're at version 2.0 and you release 2.1 even after rolling it out, it does not mean that your users will be able to download it. Google Play is very dependent on the Version Code. For those who have uploaded multiple APK's to Google Play you've probably given your build a Version Code like 98 only to see each APK show something like 200098, 300098, 400098, 500098 like shown in the picture I posted on Twitter. This becomes very important because if you notice the build of the Android App Bundle in that same picture shows the Version Code as 123. In order to download this update we had to offset our builds by 500000 so that the next build was 500124 which was therefore recognized as being a newer version than 500098 that was currently available for download.

## AndroidX (Android JetPack)

I'm not even going to pretend I fully understand everything around AndroidX. I do however like some of the promises that it's supposed to simplify the dreaded Android Support libraries. While the process I'm going to outline here is going to show you how to manually migrate to AndroidX I should add that there is hope on the horizon to make this a little easier.

> We will be shipping a migration wizard type experience in 16.3 which will do all the dirty work for you  
> \- Jonathan Dick (via Xamarin.Android Gitter)

Before you start, if your project is still using packages.config to manage it's NuGet references be sure to use the migration wizard in Visual Studio to migrate to PacakgeReference. Projects using PackageReference will have a much easier time migrating as you only need to install the Top Level dependencies and not the entire dependency chain. To start open the NuGet Package Manager for your Xamarin.Android project. Be sure to enable preview packages and install the latest `Xamarin.AndroidX.Migration` package. Once you've installed that and rebuild you should start getting build errors. As you scroll through the various build errors that appear, you'll see each error lists a current Android Support package and the corresponding AndroidX counterpart. The important thing to consider here is that you may see some crazy number like 27 packages that need to be installed. This doesn't accurately represent what the top level packages are for your project. As an example here for the [Moment app update](https://github.com/AvantiPoint/Moments) we only had to install 3 AndroidX packages directly.

-   Xamarin.AndroidX.Legacy.V4
-   Xamarin.Google.Android.Material
-   Xamarin.AndroidX.Browser

If you see the first two listed here chances are you should install them right away as they'll bring down your dependencies really quick. Don't be afraid to go to NuGet.org and look at the dependencies of each of the AndroidX packages you need to install. It will help you identify which ones you need to reference specifically and which you'll get transitively. 

You can [read more](https://devblogs.microsoft.com/xamarin/androidx-for-xamarin/) on AndroidX from Jon Douglas on the official Xamarin blog.

## Startup Tracing

AOT tends to both solve and cause a lot of problems. One of the problems that many people do not realize that they are causing for themselves is app size bloat. While AOT will speedup performance on Android, it also is likely to double the size of your app. Startup Tracing or Profiled AOT is a newer thing from the Xamarin team promising to keep the app bloat from AOT down while optimizing the AOT around startup performance where people tend to be the most frustrated. I should probably start by saying before you use AOT or Profiled AOT, do not do this for a Debug build. Doing so may encourage behavior that is not overly productive from day drinking to banging your head on the desk asking where you went wrong in life. The answer of course was using AOT in a Debug build. 

To use Profiled AOT (which is a great thing in a Release build) it really couldn't be easier. Similar to the Android App Bundle it simply requires a new property be added. The property should only be added to a Property Group intended for Release or the Store.

```xml
<PropertyGroup Condition=" '$(Configuration)|$(Platform)' == 'Release|AnyCPU' ">
    <AndroidEnableProfiledAot>true</AndroidEnableProfiledAot>
</PropertyGroup>
```

Again you can [read more](https://devblogs.microsoft.com/xamarin/faster-startup-times-with-startup-tracing-on-android/) on Startup Tracing from Jon Douglas on the official Xamarin Blog.

## Secret Sauce

Since everyone thinks there is some secret sauce I'll say there's not exactly any secret sauce... you have what you need already. That is of course until you get to the topic of CI/CD. Right now basically every tool I might rely on is pretty far behind on supporting Android App bundles.

### App Center

At the moment there isn't really anything you can do with App Bundles... in fact App Center has been pretty limiting for Android developers for a while with the fact they only supported a single artifact for distribution making it hard to generate a single APK per ABI... fast forward and they still don't have Android App Bundle support at all though the team says it should be available this month.

While you probably could install Boots and generate the .aab the problem here is that App Center wouldn't be able to do anything with the artifact and you'd probably fail the build.

### Azure Pipelines

The Xamarin.Android build task is utterly useless. I eventually gave up on it and just wrote a simple PowerShell script to generate my .aab. Luckily with Azure Pipelines you have full control over what you want to have available as an artifact so this made it really easy to grab the .aab later on so I could do something with it. What I ended up with was something like this in my Android build stage. This downloads my Keystore from Secure Storage, then does a NuGet restore (via MSBuild), builds and signs the Android app all in one single step. It's worth noting here that since Xamarin.Android already signs the generated package/bundle with a default keystore and Google Play requires the ability to use your keystore to sign the apks they generate from the App Bundle, you probably don't need the complexity of signing.

```plain
- task: vs-publisher-473885.motz-mobile-buildtasks.android-manifest-version.android-manifest-version@1
  displayName: 'Bump Android Versions in AndroidManifest.xml'
  inputs:
    sourcePath: pathTo/AwesomeApp.Android/Properties/AndroidManifest.xml
    versionName: '1.1.0'
    versionCode: $(Build.BuildId)
    versionCodeOffset: 500000

- script: sudo $AGENT_HOMEDIRECTORY/scripts/select-xamarin-sdk.sh 5_18_1
  displayName: 'Select Xamarin SDK version'

- task: pjcollins.azp-utilities-boots.boots.Boots@1
  displayName: Install Latest Android SDK
  inputs:
    uri: https://aka.ms/xamarin-android-commercial-d16-2-macos

- task: DownloadSecureFile@1
  name: androidKeyStore
  inputs:
    secureFile: $(KeystoreFileName)

- powershell: |
   if($env:SYSTEM_DEBUG -eq $true)
   {
     $extraArgs = '/bl:android.binlog'
   }
   $keystorePath = $env:KeystoreFilePath
   $keystoreName = $env:KeystoreName
   $keystorePassword = $env:KeystorePassword
   $project = $env:AndroidProjectPath
   $outputDirectory = "$($env:BUILD_BINARIESDIRECTORY)/$($env:BuildConfiguration)"
   Write-Host "Output Path = $outputDirectory"
   msbuild $project /t:SignAndroidPackage /p:Configuration=$($env:BuildConfiguration) /p:OutputPath=$outputDirectory /restore /p:AndroidKeyStore=true /p:AndroidSigningKeyStore=$keystorePath /p:AndroidSigningStorePass=$keystorePassword /p:AndroidSigningKeyAlias=$keystoreName /p:AndroidSigningKeyPass=$keystorePassword $extraArgs
  displayName: Build & Generate AppBundle
  env:
    AndroidProjectPath: 'pathTo/AwesomeApp.Android.csproj'
    Secret_AppCenterSecret: ${{ parameters.appcenterKey }}
    KeystoreFilePath: $(androidKeyStore.secureFilePath)
    KeystoreName: $(KeystoreName)
    KeystorePassword: $(KeystorePassword)

- task: PublishPipelineArtifact@0
  displayName: 'Publish BinLog'
  inputs:
    targetPath: 'android.binlog'
    artifactName: android-binlog
  condition: and(failed(), eq(variables['system.debug'], true))

- task: PublishPipelineArtifact@0
  displayName: 'Publish Package Artifacts'
  inputs:
    targetPath: '$(Build.BinariesDirectory)'
    artifactName: ${{ parameters.artifactName }}
  condition: eq(variables['system.pullrequest.isfork'], false)
```

Builds though are only the first part of it. This is where we kind of lose here. I'm sure if I spent some time I could write a script to handle this but for now manual uploads are where we're at. From Azure Pipelines there are two methods I tend to rely on to upload my artifacts to Google Play.

-   App Center Distribution task: Well as we already discussed App Center doesn't support .aab so we're out of luck there at the moment.
-   [Google Play task](https://marketplace.visualstudio.com/items?itemName=ms-vsclient.google-play): Since whoever at Microsoft is responsible for it doesn't seem to be responding to the community... I'm just not sure what to say on this front.

The important thing is that we do have a generated artifact though and with that we can at least manually upload the artifact to Google Play.
