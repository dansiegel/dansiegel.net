---
title: "Breaking Changes for Prism Autofac Users"
description: "History It's certainly been no secret that I've told user's that Autofac wasn't really a good choice for Prism Forms. To be honest just looking at the benchmarks..."
publishedAt: "2017-08-02T00:32:00.000Z"
updatedAt: "2017-08-02T10:25:02.000Z"
categories: ["Prism","Xamarin"]
tags: ["Prism","Autofac"]
legacyUrl: "/post/2017/08/02/breaking-changes-for-prism-autofac-users"
draft: false
---
## History

It's certainly been no secret that I've told user's that Autofac wasn't really a good choice for Prism Forms. To be honest just looking at the benchmarks between Autofac and DryIoc or SimpleInjector which may soon be supported, Autofac just isn't that appealing to me. The truth though, is that I wasn't just steering people away from Prism Autofac for this reason alone.

Before Prism introduced .NET Standard support, we were limited to targeting Autofac 3.5. As anyone familiar with Autofac is likely aware, the `ContainerBuilder.Update(Container)` method was deprecated. Autofac quite annoyingly wants to be an immutable container. This is problematic for frameworks like Prism, or any developer who wants to dynamically load dependencies (more on this later). Also part of the problem was that Autofac is a bit unique in the way that it handles registering and resolving. Most containers are responsible for registering dependencies, telling you if something is registered, and resolving that dependency, but Autofac wants to be different with a `ContainerBuilder` that is used for registering, a central `IContainer` that knows nothing about itself, but is happy to resolve `IComponentContext` if you need to inject something into a class to resolve dependencies in a factory method like the one used by the NavigationService to resolve your Views... 

## Major Breaking Changes

Prism Forms is architected for a Container that knows how to do stuff, continuing to have the Autofac `PrismApplication` derive from `PrismApplicationBase<IContainer>` was a poor choice. To help fix the way Autofac works with Prism Forms this was updated to `PrismApplicationBase<ContainerBuilder>`. That alone though would provide for a poor experience so this was updated to ensure that the Container property is still the `IContainer` that is set when the builder is built, and a Builder property was added to give you direct access to the `ContainerBuilder` being used in `PrismApplication` to register all of the Prism services. Unlike the builder previously used by PrismApplication, this builder waits to call `Builder.Build()` until after it registers the base Prism services, anything in your `RegisterTypes()` and anything in your `IPlatformInitializer`.

To make this work though, we also had to break all of your View Registrations. The extension methods that we typically include in Prism Forms are based on the Container for registrations. But this never made sense for Autofac, leading to extension methods that would create a builder, and then update the Container. To better align with the intent of how Autofac is meant to work the methods were updated to be based on the ContainerBuilder.

```csharp
public class App : PrismApplication
{
    protected override void RegisterTypes()
    {
        Builder.RegisterType<Foo>().As<IFoo>();
        Builder.RegisterTypeForNavigation<ViewA>();
    }
}

public class iOSInitializer : IPlatformInitializer
{
    public void RegisterTypes(ContainerBuilder builder)
    {
         builder.RegisterType<SpeakImp>().As<ISpeak>();
    }
}
```

## Modularity

Modularity hasn't been huge in the Prism Forms community like it is in the WPF community. For developers who are familiar with it, Modules are often a major part of their app development. Unfortunately Autofac's desire to be immutable poses some major problems for Modularity with Prism. Prism relies on container mutability for Modules. Part of this is that we must resolve the ModuleCatalog before we run it and initialize any of the Modules. The other part is that Prism allows us to load Modules on demand. This could for instance allow us to ship an application like Lyft and only load the Driver Module if the user is a Driver. Since Autofac is immutable this creates a major problem for us, and OnDemand Modules are out of the question due to the limitations imposed on us by the container. As such the recommended guidance for Autofac users will be to architect modules as follows:

```csharp
public class AwesomeModule : IModule
{
    public void Initialize() { }

    public static void Initialize(ContainerBuilder builder)
    {
        builder.RegisterType<FooService>().As<IFooService>();
        builder.RegisterTypeForNavigation<ViewA>();
    }
}

public class App : PrismApplication
{
    protected override void RegisterTypes()
    {
        // Initialization must be done before the Container is built.
        AwesomeModule.Initialize(Builder);
    }

    protected override void ConfigureModuleCatalog()
    {
        // Not actually needed for Autofac since all registrations must be done
        // before we build the container.
    }
}
```

## Getting Started

These changes are all available starting with Prism 7.0.0.30-ci in the [Prism MyGet feed](https://myget.org/gallery/prism). If you have not already done so, you can add that feed in either Visual Studio or Visual Studio for Mac and update your existing Prism Application's to the latest CI build. 

If you are starting with a new Project you will want to check out the updated [QuickStart Templates](/post/2017/07/16/prism-quickstart-templates) which now includes the only Module project template, and full support for the updated Autofac implementation.
