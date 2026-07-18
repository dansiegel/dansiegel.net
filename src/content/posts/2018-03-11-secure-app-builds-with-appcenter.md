---
title: "Secure App Builds with AppCenter"
description: "AppCenter has been touted as this wonderful new service from Microsoft. It's supposed to make it easier to build, test and distribute our apps. While there is a..."
publishedAt: "2018-03-11T05:00:00.000Z"
updatedAt: "2018-03-11T12:09:51.000Z"
categories: ["Xamarin"]
tags: ["Xamarin","AppCenter","DevOps"]
legacyUrl: "/post/2018/03/11/secure-app-builds-with-appcenter"
draft: false
---
AppCenter has been touted as this wonderful new service from Microsoft. It's supposed to make it easier to build, test and distribute our apps. While there is a lot I love about AppCenter, the simplification of the Build pipeline over VSTS always seemed to be problematic to me. For years I have had a pet peeve that developers often check things into source control that should never be checked in. Sometimes it's simply a backend URL, other times it could be a Client ID. These sorts of things should never be checked in, and should be injected as part of the Build pipeline. The problem is that when you have only a very simple process in place for creating a new build it opens you up to make these sorts of poor decisions with your code base.

For those who are familiar with AppCenter you may be familiar with the fact that you can [add scripts](https://docs.microsoft.com/en-us/appcenter/build/custom/scripts/) to your projects:

-   **appcenter-post-clone.sh** (Bash for iOS & Android)

```bash
#!/usr/bin/env bash

# Example: Clone a required repository
git clone https://github.com/example/SomeProject

# Example: Install App Center CLI
npm install -g appcenter-cli
```

-   **appcenter-pre-build.sh** (Bash for iOS & Android)

```bash
#!/usr/bin/env bash

# Example: Change bundle name of an iOS app for non-production
if [ "$APPCENTER_BRANCH" != "master" ];
then
    plutil -replace CFBundleName -string "\$(PRODUCT_NAME) Beta" $APPCENTER_SOURCE_DIRECTORY/MyApp/Info.plist
fi
```

-   **appcenter-post-build.sh** (Bash for iOS & Android)

```bash
#!/usr/bin/env bash

HOCKEYAPP_API_TOKEN={API_Token}
HOCKEYAPP_APP_ID={APP_ID}

# Example: Upload master branch app binary to HockeyApp using the API
if [ "$APPCENTER_BRANCH" == "master" ];
then
    curl \
    -F "status=2" \
    -F "ipa=@$APPCENTER_OUTPUT_DIRECTORY/MyApps.ipa" \
    -H "X-HockeyAppToken: $HOCKEYAPP_API_TOKEN" \
    https://rink.hockeyapp.net/api/2/apps/$HOCKEYAPP_APP_ID/app_versions/upload
else
    echo "Current branch is $APPCENTER_BRANCH"
fi
```

### Simplifying Builds

While ridiculously powerful in what you can do with these scripts (I've been told you can install pretty much anything you want), this seems like far too much effort. I'll even admit that while I'm quite capable of writing whatever scripts I want, beyond a POC, I have never, and have no plans of writing scripts, to get my projects building on AppCenter. There are some things, that shouldn't require lots of work, just to make builds work from one project to another. This is where the Mobile.BuildTools comes in. The [Mobile.BuildTools](https://www.nuget.org/packages/Mobile.BuildTools) is an easy to use NuGet package. It simply adds tooling for MSBuild and has no binaries that are injected into your application. Because of this it can be used anywhere that you have MSBuild including Visual Studio, Visual Studio Mac, Visual Studio Code, or any Build Host including AppCenter. I have often referenced it as "DevOps in a box", or at least in a NuGet. I should probably add here, that it's called Mobile.BuildTools not just because you can use it on Mobile Apps. You can use this on literally ANY .NET Project, on ANY Platform supported by MSBuild.

#### Setting Up Your Application

After installing the NuGet, we can add a JSON file to our PCL or .NET Standard named `secrets.json`, like the following:

```js
{
  "AppCenter_iOS_Secret": "{Your Secret Here}",
  "AppCenter_Android_Secret": "{Your Secret Here}"
}
```

Note that I've given it the rather long name here for illustrative purposes and to make it easier to read, but ultimately you can add as many keys as you want with whatever name you want. At build this will then automatically generate a Secrets class in your project's Helpers namespace. This will regenerate on each build, so any changes should be made to the JSON file and not the C# file. You should also add `secrets.json` and `Secrets.cs` to your `.gitignore`. If you're using my template packs, this is already done for you. 

I've gotten the question, what happens when I have some value that isn't a string? That's a fantastic question, and the Mobile.BuildTools has you covered there as well with support for string, int, double, and bool data types.

#### Protecting Your App Manifest

Sometimes secrets don't limit themselves to some constant value in our App. Sometimes we need to declare something sensitive in either our `Info.plist` or `AndroidManifest.xml`. This creates an issue for us as well. We obviously need to be able to test locally, but again we need to ensure we don't check these files in with those sensitive values. The Mobile.BuildTools again have your back. By adding these files to our `.gitignore` we keep from checking in sensitive values. In truth most of these manifests really aren't all that sensitive. To make it simple though we can simply check in a tokenized version of these manifests. Note that by default tokens should are delimited by double dollar signs before and after the variable name such as `$$AppCenterSecret$$`.

```plain
| - MyProject.sln
| - build/
| - | - AndroidTemplateManifest.xml
| - | - BuildTemplateInfo.plist
```

_Sample BuildTemplateInfo.plist_

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>AppCenter.DemoApp</string>
    <key>CFBundleName</key>
    <string>AppCenter.DemoApp</string>
    <key>CFBundleIdentifier</key>
    <string>com.appcenter.demoapp</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>MinimumOSVersion</key>
    <string>8.0</string>
    <key>UIDeviceFamily</key>
    <array>
        <integer>1</integer>
        <integer>2</integer>
    </array>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>XSAppIconAssets</key>
    <string>Assets.xcassets/AppIcon.appiconset</string>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>appcenter-$$AppCenterSecret$$</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

#### Setting Up AppCenter For Builds

Keep in mind here that our code now relies on a class called Secrets with several constants that exist nowhere in our codebase, and we have an iOS project without an Info.plist and an Android project without the AndroidManifest.xml... AppCenter offers us the ability to easily add Environment Variables. And this is where the build tools will be able to pick up what we need. 

The Mobile.BuildTools are highly configurable based on preferences, but by default a common project type such as PCL or .NET Standard library will look for any variables prefixed with `Secret_`, while platform targets look for this with their name like `iOSSecret_` or `DroidSecret_`. Setting any of these in the build will generate a `secrets.json` and resulting Secrets class in the target project. I did of course say that we have a tokenized version of our manifests which have both the wrong name and tokens that need to be replaced. Just like with the secrets though the variables need to be prefixed, however the default prefix for this is simply `Manifest_`.  

### Get Started

To get started install the Mobile.BuildTools into your project. These tools are free and open source, with documentation on additional configuration options that can be found on [GitHub](https://github.com/dansiegel/Mobile.BuildTools). If you have any issues or have a great idea that you would like to see added to the tools open an [issue](https://github.com/dansiegel/Mobile.BuildTools/issues/new).

Want to see more? Be sure to check out the [demo app](https://github.com/dansiegel/AppCenter.DemoApp "AppCenter Demo App").
