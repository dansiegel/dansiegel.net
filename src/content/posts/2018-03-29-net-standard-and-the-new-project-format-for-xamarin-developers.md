---
title: ".NET Standard & the New Project Format for Xamarin Developers"
description: ".NET Standard has really changed the ballgame for .NET Developers. In large part because the entire project system has experienced a revamp. Lately I've found..."
publishedAt: "2018-03-29T03:43:00.000Z"
updatedAt: "2018-05-15T09:46:51.000Z"
categories: [".NET","Prism","Xamarin"]
tags: ["Xamarin",".NET","Prism","NuGet"]
legacyUrl: "/post/2018/03/29/net-standard-and-the-new-project-format-for-xamarin-developers"
draft: false
---
.NET Standard has really changed the ballgame for .NET Developers. In large part because the entire project system has experienced a revamp. Lately I've found myself really encouraging developers to update their PCL libraries to .NET Standard 2.0. For developers who haven't made the jump it's easy to find yourself saying "no we can't do it". In reality it doesn't take as much effort as you think it does to update your projects. Why should you update your projects though? Well for starters PCL is painful, you lookup how to do something only to find out that it's not supported and sometimes there's no workaround. With .NET Standard the missing API's that lead to weird workarounds is a thing of the past.

### Upgrading

Upgrading really isn't as hard as you may think. For starters your csproj is going to start out about as simple as:

```xml
<Project Sdk="Microsoft.NET.Sdk" ToolsVersion="15.0">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>
</Project>
```

Then of course we need to start adding in your dependencies. Now this is where it gets "Hard". It's hard because it means you need some familiarity with your project. You need to know what are the top level dependencies that your project has. For example if you're using Prism there are generally 3 Prism packages you're referencing, Prism.Core, Prism.Forms, and Prism.{Some Container}.Forms. It's only the last one that you actually need to reference in the new project format. You can of course add this from either Visual Studio or Visual Studio Mac or update it manually so that your project file now looks like:

```xml
<Project Sdk="Microsoft.NET.Sdk" ToolsVersion="15.0">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Prism.DryIoc.Forms" Version="7.0.0.396" />
  </ItemGroup>
</Project>
```

Assuming you wanted to get started with Prism for Xamarin Forms this would be all you would actually need as all three Prism packages are automatically brought in along with Xamarin Forms. Now let's say that you wanted to target a newer version of Xamarin Forms than 2.5.0.122203, such as the 3.0 preview that's now available. You simply need to add a new PackageReference for that version of Xamarin Forms or install it in the IDE's Package Manager.

That may seem too easy, and it is. Of course you need to make some more changes. You'll need to find the packages.config or project.json and delete those files... If you have a standard `Properties/AssemblyInfo.cs` you'll need to go ahead and send that one to the trash as well. With that your project is upgraded, and you're wondering why you didn't do this sooner....

### Multi Targeting

Around 5 years ago I first started trying to Multi-Target. My earliest attempts were pretty bad with a csproj file for each framework I wanted to target, all part of the same solution, and it generally resulted in build errors due to file locks as I had no clue how the build system worked back then. Honestly I've never found much documentation that made it very easy, and while I eventually figured out I could do lots of MSBuild trickery to make it work, and then manually develop a nuspec to pack my library, it was always really painful. The new Project system gives us some real advantages for Mutli-Targeting that make it a real breeze.

I suppose though I should start with why on earth should you multi-target... and when would you want to? If you're a Xamarin developer chances are you want to Multi-Target. Internally and for all of my clients I generally start off with a common library. This is something that is really helpful to give me extensions, and custom controls that I may want to use across all of my apps or components like a Prism Module. A lot of that code is truly portable and I could easily handle it with a simple netstandard2.0 class library. However sometimes I'm implementing Platform Effects and Renderers for my controls that instantly require that I have a native binary for my iOS and Android projects. This is where multi-targeting really becomes very powerful. By Multi-Targeting I maintain a single Project which generates a single binary, native to the platform I need to target. Now if we expand on the basic project structure we saw above and now update our csproj to look like the following we can target both .NET Standard 1.3 & 2.0, along with Android, iOS, Mac, and UWP. It's worth noting that the non .NET Standard targets are really getting a lot of help due to the MSBuild.Sdk.Extras package from [Oren Novotny](https://oren.codes/).  

```xml
<Project Sdk="MSBuild.Sdk.Extras/1.5.4" ToolsVersion="15.0">
  <PropertyGroup>
    <TargetFrameworks></TargetFrameworks>
    <TargetFrameworks Condition=" '$(OS)' == 'Windows_NT' ">netstandard1.3;netstandard2.0;Xamarin.iOS10;Xamarin.Mac2.0;MonoAndroid80;uap10.0.16299</TargetFrameworks>
    <TargetFrameworks Condition=" '$(OS)' != 'Windows_NT' ">netstandard1.3;netstandard2.0;Xamarin.iOS10;Xamarin.Mac2.0;MonoAndroid80</TargetFrameworks>
  </PropertyGroup>
  <ItemGroup>
    <Compile Remove="**/Platform/**/*.cs" />
    <None Include="**/Platform/**/*.cs" />
  </ItemGroup>
  <ItemGroup Condition=" $(TargetFramework.StartsWith('MonoAndroid')) ">
    <None Remove="**/Platform/Droid/**/*.cs" />
    <Compile Include="**/Platform/Droid/**/*.cs" />
  </ItemGroup>
  <ItemGroup Condition=" $(TargetFramework.StartsWith('Xamarin.iOS')) ">
    <None Remove="**/Platform/iOS/**/*.cs" />
    <Compile Include="**/Platform/iOS/**/*.cs" />
  </ItemGroup>
  <ItemGroup Condition=" $(TargetFramework.StartsWith('Xamarin.Mac')) ">
    <None Remove="**/Platform/macOS/**/*.cs" />
    <Compile Include="**/Platform/macOS/**/*.cs" />
  </ItemGroup>
  <ItemGroup Condition=" $(TargetFramework.StartsWith('uap10.0')) ">
    <None Remove="**/Platform/UWP/**/*.cs" />
    <Compile Include="**/Platform/UWP/**/*.cs" />
  </ItemGroup>
</Project>
```

So what's going on here anyway? Well for starters we're establishing some conventions for our code. We are saying that anywhere in our project that we have a folder named **Platform** we are going to change the inclusion of those files from **Compile** to **None**. This means that the IDE will display our code while MSBuild will ignore our code. Then, we start conditionally adding code back in so that when MSBuild is compiling for iOS and it encounters code that has a path that includes **Platform/iOS**, that code will be added back in for compilation. 

### Generating a NuGet

If you're trying to generate a library that you can easily consume in your projects, or if you're trying to make it available for the community at large, these new SDK style projects are make generating a NuGet easier than ever. You just need to worry about what targets you want to compile for, and the NuGet largely takes care of itself with very little that we actually need to add. It's really just a few properties that we need to add to our project. Of course, if you take a look at any of my projects you'll notice a recurring theme, most of my NuGet configurations aren't even in the project file at all. Along the way I've come to realize the power of a file called Directory.build.props. This is a little bit of a magic file. If it exists anywhere from the solution folder to your project folder it will automatically be picked up by MSBuild. 

#### Looking at a real world example

Prism has more than 15 NuGet packages that have to generated on every build. Honestly for WPF we still use the older style projects which is a painful process, but the rest of the projects all share a lot of common logic.

-   If there is a project that isn't a test project we don't want it to Generate a NuGet. 
-   The package authors are always going to the members of the Prism Team.
-   The source is always located on GitHub in the same repository.
-   We always want to provide symbols packages.

Without using the Directory.build.props in our solution directory we would have to replicate this information in every single project file. 

#### Setting your project up for NuGet Packaging

If you want to pack your project all you really need to do is to add the following Directory.build.props to your project:

```xml
<Project>
  <PropertyGroup>
    <Product>$(AssemblyName) ($(TargetFramework))</Product>
    <NeutralLanguage>en</NeutralLanguage>
    <Authors>Your Name Here</Authors>
    <VersionPrefix>1.0.0</VersionPrefix</VersionPrefix>
    <VersionPrefix Condition=" '$(BUILD_BUILDID)' != '' ">$(VersionPrefix).$(BUILD_BUILDID)</VersionPrefix>
    <IS_PREVIEW Condition=" '$(IS_PREVIEW)' == '' ">false</IS_PREVIEW>
    <IS_RELEASE Condition=" '$(IS_RELEASE)' == '' ">false</IS_RELEASE>
    <VersionSuffix>ci</VersionSuffix>
    <VersionSuffix Condition=" $(IS_PREVIEW) ">pre</VersionSuffix>
    <VersionSuffix Condition=" $(IS_RELEASE) "></VersionSuffix>
    <PackageProjectUrl>https://github.com/USER/PROJECT_NAME</PackageProjectUrl>
    <PackageLicenseUrl>https://github.com/USER/PROJECT_NAME/blob/master/LICENSE</PackageLicenseUrl>
    <RepositoryType>git</RepositoryType>
    <RepositoryUrl>https://github.com/USER/PROJECT_NAME</RepositoryUrl>
    <IncludeSymbols>True</IncludeSymbols>
    <IncludeSource>True</IncludeSource>
    <PackageOutputPath>$(MSBuildThisFileDirectory)Artifacts</PackageOutputPath>
    <PackageOutputPath Condition=" '$(BUILD_ARTIFACTSTAGINGDIRECTORY)' != '' ">$(BUILD_ARTIFACTSTAGINGDIRECTORY)</PackageOutputPath>
    <IsTestProject>$(MSBuildProjectName.Contains('Test'))</IsTestProject>
    <GenerateDocumentationFile>!$(IsTestProject)</GenerateDocumentationFile>
    <GeneratePackageOnBuild>!$(IsTestProject)</GeneratePackageOnBuild>
  </PropertyGroup>
</Project>
```
