---
title: "IoT Cluster with Raspberry Pi"
description: "IoT has been exploding over the past few years, and nowhere is more evident than with the community surrounding the Raspberry Pi. It is probably one of the most..."
publishedAt: "2015-12-21T06:03:00.000Z"
updatedAt: "2017-05-09T19:47:07.000Z"
categories: []
tags: ["Raspberry Pi","Docker","Iot"]
legacyUrl: "/post/2015/12/21/iot-cluster-with-raspberry-pi"
heroImage: "/images/blog/iot-cluster-with-raspberry-pi/01-image.webp"
draft: false
---
IoT has been exploding over the past few years, and nowhere is more evident than with the community surrounding the Raspberry Pi. It is probably one of the most versatile ARM platforms being used today. With all of this support we have a wide degree of options.

![IoT Cluster with Raspberry Pi](/images/blog/iot-cluster-with-raspberry-pi/01-image.webp)

5 Raspberry Pi 2's running in a Docker Swarm

Enter Docker... with the benefit of preconfigured images from [Hypriot](http://blog.hypriot.com/downloads/), you can now easily set up a fully functional Docker Swarm in mere minutes. For those who know about Docker, let me start by saying I don't believe you'll learn anything new from this post other than perhaps you can make it work on Raspberry Pi.

  

As for functionality with Docker Swarm running I was able to quickly deploy a number of services including MariaDB, PostGRE, [Gogs](https://gogs.io/), along with a number of other applications. It really shouldn't come as a huge surprise that you can have highly available services which are easily deployed using Docker, for me what was the most telling factor was the hardware involved.

### Hardware

One of the first things you may notice about the hardware is I had no real cost for my cables or switch. That's because I pulled out a few old cables and a switch I knew I should throw out but for some reason kept.

Qty

Item

Cost

5

Raspberry Pi 2

$35/ea

5

Micro Sd Cards

$7/ea

6

Cat 5 Cables

$10

1

Old 100mb Switch

$15

### Conclusions

Now I should probably say I would probably not recommend this for a larger business, but when you have an fully functional cluster of actual physical hardware that can provide Enterprise like availability, drawing very little power... I would say this is an excellent feature for small businesses which may be a little shy about having some hosting service host their data in the "Cloud".

### Additional Reading

-   [Introducing Hypriot Cluster Lab: Docker clustering as easy as it gets](http://blog.hypriot.com/post/introducing-hypriot-cluster-lab-docker-clustering-as-easy-as-it-gets/) - Dec 8, 2015
-   [Let Docker Swarm all over your Raspberry Pi Cluster](http://blog.hypriot.com/post/let-docker-swarm-all-over-your-raspberry-pi-cluster/) - July 3, 2015

### Downloads

-   Hypriot Docker Image for Raspberry Pi - Version 0.6.1 Hector - [Download](http://downloads.hypriot.com/hypriot-rpi-20151115-132854.img.zip) - [Checksum](http://downloads.hypriot.com/hypriot-rpi-20151115-132854.img.zip.sha256) - Published 11-15-2015
-   Hypriot Cluster Lab - Version 0.1 - [Download](http://downloads.hypriot.com/hypriot-rpi-20151128-152209-docker-swarm-cluster.img.zip) - [Checksum](http://downloads.hypriot.com/hypriot-rpi-20151128-152209-docker-swarm-cluster.img.zip.sha25)\- Published 12-8-2015
