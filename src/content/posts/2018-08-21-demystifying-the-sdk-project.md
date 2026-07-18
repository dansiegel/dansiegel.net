---
title: "Demystifying the SDK Project"
description: "I am often, and rightfully, accused of living on the bleeding edge. It can be quite painful being there as ideas are not always fully flushed out, and tooling is..."
publishedAt: "2018-08-21T01:00:00.000Z"
updatedAt: "2020-03-09T07:35:46.000Z"
categories: [".NET","Xamarin"]
tags: ["Xamarin",".NET","SDK Projects"]
legacyUrl: "/post/2018/08/21/demystifying-the-sdk-project"
heroImage: "/images/blog/demystifying-the-sdk-project/01-image.webp"
draft: false
---
I am often, and rightfully, accused of living on the bleeding edge. It can be quite painful being there as ideas are not always fully flushed out, and tooling is often just not there yet. When Microsoft began the push towards .NET Core and .NET Standard, I knew this was an area that I needed to be. It was clear to me that this was a major shift that was going to make .NET development more appealing to a variety of developers, and businesses. As I set out to learn this new paradigm I both struggled and enjoyed the massive project system simplification that was introduced in the xproj format with a json configuration. For a variety of reasons though at the 11th hour Microsoft completely changed directions going back to the csproj and ditching the whole concept of a json configuration altogether. For months I struggled to understand what was going on. 

## Why I struggled

There were a lot of reasons I struggled. The project system has a lot of loose but very important couplings with MSBuild. Frankly I had heard of msbuild, but I knew so little about it that I simply called it "The Compiler" (which is very inaccurate). Another reason that I struggled is that there isn't exactly a lot of documentation to explain how the project system works, or what elements mean. Then of course have you ever looked at the older style of csproj? There is a lot of nonsense xml going on there. You can kind of figure out some stuff. You can for instance figure out that any of your code files that need to be compiled needed a `Compile` tag to include it in the compilation, but what on earth is all of the other crazy stuff going on there?

## Breaking Through

The new SDK Style projects really help make what's going on in the project system easier to understand and customize because it's not polluted by a lot of insanity. You don't need to add a bunch of duplicate settings for Debug vs Release since it's already assumed these build configurations exist and we have some standard assumptions about them, like Release builds need to be optimized, while Debug configurations need all of our debug symbols to be able to step into them. Then of course we make some standard assumptions like all of your code files should be compiled (known as File Globbing). What's left over is often a file that has a `PropertyGroup` with a single `TargetFramework`.

### PropertyGroup vs ItemGroup

While this can get a little crazy when we start looking at creating custom build targets, we'll keep this simple for now. A PropertyGroup, is exactly what it sounds like. It's an area where you can declare Properties (think variable declarations), that will be used in the build process. There are a number of built in Properties ([Well-Known & Common properties](https://msdn.microsoft.com/en-us/library/ms164309.aspx?f=255&MSPPError=-2147217396)) that really come from msbuild, these include things like specifying the Assembly Name, where the build output should go, and some specialty variables that can be used to get things like the path to the Project File, or the current directory. While these properties can help us there are a number of other properties that can come into play from all over, and we can frankly make up properties as we see fit (more on that later).

Ok so now we have an idea about the PropertyGroup so what about ItemGroup's? Well ItemGroup's are all about grouping Items we need to do SOMETHING with. I admit that probably doesn't clarify what I mean. So let's look at the Xamarin Essentials csproj. It's a good use case where the decision was made to turn off the default file globbing.

```xml
<ItemGroup Condition=" $(TargetFramework.StartsWith('netstandard')) ">
    <Compile Include="**\*.netstandard.cs" />
    <Compile Include="**\*.netstandard.*.cs" />
  </ItemGroup>
  <ItemGroup Condition=" $(TargetFramework.StartsWith('uap10.0')) ">
    <PackageReference Include="Microsoft.NETCore.UniversalWindowsPlatform" Version="6.1.5" />
    <SDKReference Include="WindowsMobile, Version=10.0.16299.0">
      <Name>Windows Mobile Extensions for the UWP</Name>
    </SDKReference>
    <Compile Include="**\*.uwp.cs" />
    <Compile Include="**\*.uwp.*.cs" />
  </ItemGroup>
```

There is a lot going on in this snippet so let's break this up. First you'll notice some conditions on these ItemGroup's. You do not have to ever use a Condition, but you can also put a Condition on Any Element. As I mentioned before, the EnableDefaultCompileItems Property was set to false, meaning that when this project is built, it will not compile ANY of the code unless we do something to include code. What you see here is that they have adopted a practice in which each file contains a platform identifier. This then allows them to have a condition in which the TargetFramework is evaluated and determine which C# files should be included in the compilation. Often times you may see multiple ItemGroup's in a csproj, with each Group containing a single set of Items, for instance only Embedded items, or Compile items, Project References. You'll notice here though that the ItemGroup can contain any set of Items, as the UWP ItemGroup contains a PackageReference, an SDKReference for Windows Mobile, and adds the UWP C# code.

## Multi-Targeting

Perhaps one of my favorite features of the SDK Style Project is that it makes Multi-Targeting that much easier. As you may have noticed in the snippet above from the Xamarin Essentials csproj, they have a single Project that targets both UWP and netstandard. Honestly, Microsoft only get's partial credit here. The new Project system introduces the ability to specify `TargetFrameworks` rather than a single `TargetFramework` if we so choose. Unfortunately the team only thought about Full Framework Targets like net45 and netcore/netstandard targets, which is why I say they get partial credit. For the Xamarin Developer (or even the 3 UWP developers out there), this gets really frustrating. Luckily the community has Microsoft MVP/RD Oren Novotny, who developed a completely custom SDK that ships via NuGet which introduces support for all kinda of new targets including UWP, Xamarin iOS, Android, Mac, and even Tizen and WPF.

```xml
<Project Sdk="Microsoft.NET.Sdk">
    <!-- Standard SDK Sytle Project that doesn't support cool targets -->
    <<TargetFramework>netstandard2.0</TargetFramework>
</Project>
```

So what do we have to do to start Multi-Targeting more fun targets as a Xamarin Developer? Well it's actually pretty simple, again thanks to Oren, the Microsoft team added support so that all we need to do is replace the value in the Sdk attrubute of the Project. To start with let's look how you might do this if you only care about a single Project. 

```xml
<Project Sdk="MSBuild.Sdk.Extras/2.0.54">
    <!-- Single Multi-Targeting Project... You control the version here as part of the Sdk string -->
    <TargetFrameworks>netstandard2.0;xamarin.ios;xamarin.android;uwp10.0.16299</TargetFrameworks>
</Project>
```

Suddenly you have the ability to create a single project that targets all of the platforms you want. But what about those cases where you still need to break code up into multiple projects? Well again it's very simple. Simply add `MSBuild.Sdk.Extras` as the Sdk value and then drop in a file called global.json next to your solution. (NOTE: You'll notice that this is what I've done for Prism)

```js
{
    "msbuild-sdks": {
        "MSBuild.Sdk.Extras": "2.0.54"
    }
}
```

Of course you could ask why should you care about Multi-Targeting? Well have you ever noticed that you have to do some crazy thing like:

```csharp
global::SomeProject.Platform.CoolRenderer.Init();
```

Suddenly you're referencing a bunch of Init methods that look like this:

```html
public static void Init()
{
    // The Linker Sucks
}

public static void Init()
{
    // Watch the build is going to warn me about a variable I'm not actually using for anything....
    var a = DateTime.Now;
}
```

To me this has always been code smell. Ultimately the real reason you're having to do this so often is to ensure that the Linker sees an actual reference in code that goes into the Platform specific binary. This was a problem with the old project system since we had to have a sharable project (PCL), and then platform projects each of which needed to be bundled into a single NuGet. By Multi-Targeting you've already made references into the assembly to keep it from being stripped out reducing the legwork you need to do, to tell the Linker to pay attention to something else.

### Multi-Targeting Snafu

Multi-Targeting is a fantastic tool. Unfortunately for those working on a Mac there is a little bit of legwork you need to do. Visual Studio Mac does not currently support Multi-Targeting projects. It really should, and is very overdue in my opinion. If you agree, I suggest pinging Jordan Matthiesen ([@JMatthiesen](https://twitter.com/JMatthiesen)) to let him know this needs to be a top priority for the team (and in the next alpha release)... I did say there is a little bit of legwork you need to do though, I never said it doesn't work. MSBuild LOVES Multi-Targeting so you can build these projects from the command line all day long. In fact, as one of the nice things that Mac developers get for FREE, both MSBuild and NuGet are added to your PATH when you installed Visual Studio Mac making building from the command line very easy. Generally for these Multi-Targeting projects I simply move my workflow into Visual Studio Code where I can easily write code and build from the integrated terminal.

I should probably admit the pain doesn't entirely stop there. UWP is simply an unresolvable target. The solution? Earlier I mentioned Conditions can be applied to any element, which includes the TargetFramworks element. If you lookup the well known MSBuild variables there is an OS variable. Unfortunately it's a bit simplistic meaning you're not going to figure out if you're on a Mac or Ubuntu or Centos, or Windows 7 or Windows 10... but you can at least figure out one thing... are you on Windows or not. So what does that look like:

```xml
<Project Sdk="MSBuild.Sdk.Extras">
    <PropertyGroup>
        <TargetFrameworks>netstandard1.0;netstandard2.0;Xamarin.iOS10;MonoAndroid71;MonoAndroid80;MonoAndroid81;MonoAndroid90;MonoAndroid10.0</TargetFrameworks>
        <TargetFrameworks Condition=" '$(OS)' == 'Windows_NT' ">$(TargetFramework);uap10.0.16299</TargetFrameworks>
    </PropertyGroup>
</Project>
```

## Packaging

Some of you may be wondering why you should be packaging your code? I've talked with a number of developers over the years who are engaged in a process in which for each release the entire code base is pulled from source control and built and released in one go. I've heard some interesting arguments for the practice, though I completely disagree with them. To be clear obviously something has to be built, but all of your common support libraries should be built and packaged as they are updated. There are actually a few benefits to this:

1.  This reduces build times... Imagine you have a single support library that's used in 5 applications that are released across your organization. This literally eliminates 4 completely unnecessary builds of that single project. Of course the reality is that you probably have a bunch of support libraries making the results that much greater.  
    ![Demystifying the SDK Project](/images/blog/demystifying-the-sdk-project/01-image.webp)
2.  Versioning... It is a little scary when you think about it, but so many companies NEVER version their code. I have literally seen projects that started 15 years ago that are still on version 1.0.0.0 (from the template). In my experience these are companies that are probably storing your passwords in clear text, prefer http over https, and think a 56k modem is high speed internet instead of a painful memory of the 1990's. If you aren't versioning your code you really have no idea when a problem was introduced, if a problem has been fixed, or a regression has been made... you only have guesses.
3.  Garbage In -> Garbage Out... because you've built and shipped that project independent of the rest of your monolithic applications, it means that you have had a chance to validate the code base before it finds it's way into use by others in your development team or a production environment. For many (realistically) this means that you are protecting yourself from that developer who checked in code that doesn't build. For others it means that you have ensured that all of your unit tests for that project have both run and passed.
4.  Testability... I know what you're thinking, you're perfect, and so are the rest of the developers on your team. I totally understand, that's why I like to wear the shirt declaring "I don't always test my code, but when I do, I do it in Production". But for that time when maybe you forgot to update that one repo that you aren't responsible for, but that repo is required to build the project you are responsible for. The simple truth is as a .NET developer you're used to looking at the package manager for Updates. When your support libraries are packaged and available to your team via a private or public NuGet feed, it becomes easy to discover that an update is available. Because the discoverability is actually going up, it means that the entire team really has a better opportunity to test the code in development before it ever sees production.

### How do you get started?

Maybe you didn't need convincing, maybe you just need to know how to get started. Well for starters, let's completely toss out the idea of using a nuspec. They're annoying and frankly if you're multi-targeting... they are error prone. There are still a few monolithic projects out there like Xamarin.Forms that still require the use of a nuspec (largely due to the issues around Packing that the NuGet team needs to fix/implement), but the reality is that if you're using a Sdk Style project you probably don't need it.

Earlier I mentioned that you could completely make up properties to put in the PropertyGroup of your csproj. Well when the Sdk Style projects were created, the folks at Microsoft decided to make up some new Properties to help with the very common task of packaging your projects. Many of these properties can be found at the links below. Some are a little harder to discover such as the GeneratePackageOnBuild property. By default this is false, however when you set this to true, all you need to do is build your project and each build will generate a new NuGet package for any packable projects in your solution. You'll find there is no right or wrong way as much as there is a way that makes sense for the project you are working on. Many of my projects, including Prism include a Directory.build.props in the solution directory, this allows me to set this value in a single place. Since IsPackable is true by default this means that you need to have some logic to set IsPackable to false on projects that should not be packed such as Tests and Samples.

### Project References... Package References Oh My

You may know a little bit about a Project Reference and Package Reference. The difference here being that a Package Reference comes in from a NuGet feed, while a Project Reference is a Reference to a local project in the file system. So what happens then when you want to build and package a project? What happens to those Project References? A friend of mine recently asked if I could come take a look at a project he had been working on. Well every Project Reference is assumed to be a Reference that will be needed by the generated package. This means that there is no need to have some crazy conditional includes for a Package configuration.

```xml
<Project Sdk="MSBuild.Sdk.Extras">
    <PropertyGroup>
        <TargetFramework>netstandard2.0</TargetFramework>
    </PropertyGroup>

    <ItemGroup Condition=" $(Configuration) != 'NuGetRelease' ">
        <ProjectReference Include="../AnotherProject/AnotherProject.csproj" />
    </ItemGroup>

    <ItemGroup Condition=" $(Configuration) == 'NuGetRelease' ">
        <PackageReference Include="AnotherProject" Version="$(Version)" />
    </ItemGroup>
</Project>
```

All you actually need is just your ProjectReference. When the project is built, this assumes that it is being Packed and will actually pick up whatever the version number is that, that specific project was packed with.

```xml
<Project Sdk="MSBuild.Sdk.Extras">
    <PropertyGroup>
        <TargetFramework>netstandard2.0</TargetFramework>
    </PropertyGroup>
    <ItemGroup>
        <ProjectReference Include="../Foo/Foo.csproj" />
    </ItemGroup>
</Project>
```

Because it will pick up the other project automatically it means that you just need to ensure that the Pack target is invoked.

```bash
> dotnet pack MyProject.csproj -c Release
> msbuild MyProject.csproj /p:Configuration=Release /t:pack
```

Earlier I mentioned the GeneratePackageOnBuild element which is false by default. All we need to do is set this to true like in the following example or add it to our Directory.build.props file and EVERY build will now generate a package automatically.

```xml
<Project Sdk="MSBuild.Sdk.Extras">
    <PropertyGroup>
        <TargetFramework>netstandard2.0</TargetFramework>
        <GeneratePackageOnBuild>true</GeneratePackageOnBuild>
    </PropertyGroup>
</Project>
```

## Directory.build.props

For those paying attention, you've heard me mention the Directory.build.props... this is one of my favorite files, and in some ways a replacement for the nuspec\*, in other ways it's just something I use to make my DevOps processes smoother. This is a slightly refined version of what I have published previously.

```xml
<Project>
  <PropertyGroup>
    <Product>$(AssemblyName) ($(TargetFramework))</Product>
    <DefaultLanguage>en-US</DefaultLanguage>
    <Authors>Your Name Here</Authors>
    <Copyright>© $([System.DateTime]::Now.Year) Your Name Here</Copyright>
    <PackageIconUrl>Uri to an icon image (png)</PackageIconUrl>
    <PackageLicenseUrl>Uri to the license</PackageLicenseUrl>
    <PackageProjectUrl>Uri to the project</PackageProjectUrl>
    <RepositoryUrl>Uri to clone the project</RepositoryUrl>
    <PackageRequireLicenseAcceptance>false</PackageRequireLicenseAcceptance>
    <RepositoryType>git</RepositoryType>
    <!-- Root control Version Prefix -->
    <VersionPrefix>1.0.0</VersionPrefix>
  </PropertyGroup>

  <!-- CI Helpers -->
  <PropertyGroup>
    <PackageOutputPath>$(MSBuildThisFileDirectory)/Artifacts</PackageOutputPath>
    <PackageOutputPath Condition=" $(BUILD_ARTIFACTSTAGINGDIRECTORY) != '' ">$(BUILD_ARTIFACTSTAGINGDIRECTORY)</PackageOutputPath>
    <IsPackable Condition=" $(ProjectName.Contains('Sample')) ">false</IsPackable>
    <IsPackable Condition=" $(ProjectName.Contains('Test')) ">false</IsPackable>
    <GeneratePackageOnBuild>$(IsPackable)</GeneratePackageOnBuild>
    <IS_PREVIEW Condition=" $(IS_PREVIEW) == '' ">false</IS_PREVIEW>
    <IS_RELEASE Condition=" $(IS_RELEASE) == '' ">false</IS_RELEASE>
    <VersionPrefix Condition=" $(BUILD_BUILDNUMBER) != '' ">$(VersionPrefix).$(BUILD_BUILDNUMBER)</VersionPrefix>
    <VersionSuffix>ci</VersionSuffix>
    <VersionSuffix Condition=" $(IS_PREVIEW) ">pre</VersionSuffix>
    <VersionSuffix Condition=" $(IS_RELEASE) "></VersionSuffix>
  </PropertyGroup>
</Project>
```

You'll notice that in this Directory.build.props file I have split it into two PropertyGroups to make it a little easier to read. So let's take a look at the first PropertyGroup.

-   Product: The Product line here gets updated to include both the Target Framework and Assembly Name instead of just the Assembly Name. This is particularly helpful for multi-targeting projects as it can help identify which framework specifically was being used when an error occurred.
-   You'll notice several elements here that contain placeholders for Uri's for specific to your project, and your name. These are all elements that came from the nuspec which are now taken care of and will be uniform across your entire solution helping to ensure that you don't have to duplicate values all over. 
-   VersionPrefix: This is the root version number that I want to control. Every single build will start with this version string.

Ok great, now let's take a little closer look at what's going on in the CI Group.

-   PackageOutputPath: Maybe you have just one project, or maybe you have 10 that are built and packaged for your solution. Even with one, it can get a little tedious to have to drill down into the Project's output folder {Path To Project}/bin/{Build Configuration} each time you want to get the generated NuGet. When you have multiple projects though this gets really annoying. By setting this value we ensure that all of the packages are created in a common location making it easier to find. By default we are creating an Artifacts folder under the current directory (where the Directory.build.props is located). On VSTS however we are defaulting that location to be in the Artifact Staging Directory defined by VSTS.
-   IsPackable: By default this is true, so we have a check to see if the Project Name contains either the word Test or Sample. If it contains either one we mark the project as NOT packable.
-   GeneratePackageOnBuild: By default this is false meaning you either need to explicitly invoke the Pack target. By setting this to true we will generate the Packages on each build. If this is too much, or you don't want to accidentally ship a Debug build, you could add a condition to only set it to true when the build Configuration is Release.

\*NOTE:  
Just to prevent some confusion here, there is still a nuspec in the process, only it is automatically generated by the build task rather than you having to maintain it as part of your project.

### Helpful Links

-   [Additions to the csproj format for .NET Core](https://docs.microsoft.com/en-us/dotnet/core/tools/csproj)
-   [NuGet pack and restore as MSBuild targets](https://docs.microsoft.com/en-us/nuget/reference/msbuild-targets)

For more information and to see how I build many of my tools and support libraries see this post I wrote on [the new Project Format](/post/2018/03/29/net-standard-and-the-new-project-format-for-xamarin-developers). Still have questions feel free to leave a comment or reach out on Twitter.
