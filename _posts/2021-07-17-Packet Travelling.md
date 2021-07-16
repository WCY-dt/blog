---
layout: post
title:  "Packet Travelling <img src='https://img.shields.io/badge/-转载-C9284D?style=flat'>"
date:   2021-07-17 00:00:00 +0800
categories: toturial
tags: 网络
comments: true
mathjax: true
---

本文转载自[Practical Networking .net](https://www.practicalnetworking.net/series/packet-traveling/packet-traveling/)。

# OSI Model

**The Open Systems Interconnect model (OSI Model) explains all the individual functions that are necessary for the Internet to work.**

It is a set of seven *independent* functions which combine to accomplish the end-goal of Computer to Computer communication.

Much like a car is composed of independent functions which combine to accomplish the end-goal of moving the car forward: A battery powers the electronics, an alternator recharges the battery, an engine rotates a driveshaft, an axle transfers the driveshaft’s rotation to the wheels, and so on and so forth.

Each individual part can be independently replaced or worked on, and as long as each individual part is functioning properly, the car moves forward.

The **OSI model is divided into seven different layers, each of which fulfills a very specific function**. When combined together, each function contributes to enables full computer to computer data communication.

 

![OSI Model](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-osi-layers-236x300.png)

In the rest of this article, we will look at each of the individual layers of the OSI model and their individual responsibility.

 

## OSI Layer 1 – Physical

The Physical layer of the OSI model is responsible for the transfer of bits — the 1’s and 0’s which make up all computer code.

This layer represents the physical medium which is carrying the traffic between two nodes. An example would be your [Ethernet cable](https://www.practicalnetworking.net/stand-alone/ethernet-wiring/) or Serial Cable. But don’t get too caught up on the word “Physical” — this layer was named in the 1970s, long before wireless communication in networking was a concept. As such, WiFi, despite it not having a physical, tangible presence, is also considered a Layer 1 protocol.

Simply put, **Layer 1 is anything that carries 1’s and 0’s between two nodes**.

The actual format of the data on the “wire” can vary with each medium. In the case of Ethernet, bits are transferred in the form of electric pulses. In the case of Wifi, bits are transferred in the form of radio waves. In the case of Fiber, bits are transferred in the form of pulses of light.

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-physical-wires-1024x221.png" alt="OSI Model - Layer 1" style="zoom:50%;" />

Aside from the physical cable, Repeaters and Hubs also operate at this layer.

A Repeater simply repeats a signal from one medium to the other, allowing a series of cables to be daisy chained together and increase the range a signal can travel beyond the single cable limit. These are commonly used in large WiFi deployments, where a single WiFi network is “repeated” throughout multiple access-points to cover a larger range.

A Hub is simply a multi-port Repeater. If four devices are connected to a single Hub, anything sent by one device gets repeated to the other three.

 

## OSI Layer 2 – Data Link

The Data Link layer of the OSI model is responsible for interfacing with the Physical layer. Effectively, Layer 2 is responsible for putting 1’s and 0’s on the wire, and pulling 1’s and 0’s from the wire.

The Network Interface Card (NIC) that you plug your Ethernet wire into handles the Layer 2 functionality. It receives signals from the wire, and transmits signals on to the wire.

Your WiFi NIC works the same way, receiving and transmitting radio waves which are then interpreted as a series of 1’s and 0’s.

**Layer 2 will then group together those 1’s and 0’s into chunks known as Frames.**

There is an addressing system that exists at Layer 2 known as the Media Access Control address, or MAC address. **The MAC address uniquely identifies each individual NIC**. Each NIC is pre-configured with a MAC address by the manufacturer; in fact, it is sometimes referred to as the Burned In Address (BIA).

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-nics-and-switches-1024x241.png" alt="OSI Model - Layer 2" style="zoom:50%;" />

Aside from your NIC, a Switch also operates at this layer. **A Switch’s primary responsibility is to facilitate communication *within* Networks**.

The overarching function of the Data Link layer is to deliver packets from one NIC to another. Or to put it another way, **the role of Layer 2 is to deliver packets from *hop to hop***.

 

## OSI Layer 3 – Network

The **Network layer of the OSI model is responsible for packet delivery from end to end**.

It does this by using another addressing scheme that can logically identify every node connected to the Internet. This addressing scheme is known as the Internet Protocol address, or the IP Address.

It is considered logical because an IP address is not a permanent identification of a computer. Unlike the MAC address which is considered a physical address, the IP address is not burned into any computer hardware by the manufacturer.

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-router-300x179.png" alt="OSI Model - Router" style="zoom:25%;" />

Routers are Network Devices that operate at Layer 3 of the OSI model. **A Router’s primary responsibility is to facilitate communication \*between\* Networks**. As such, a Router creates a boundary between two networks. In order to communicate with any device not directly in your network, a router must be used.

 

## OSI Model – Layer 2 vs. Layer 3

The interaction and distinction between Layer 2 and Layer 3 is crucial to understanding how data flows between two computers. For example, if we already have a unique L2 addressing scheme on every NIC (like MAC addresses), why do we need yet another addressing scheme at L3 (like IP addresses)? Or vice versa?

The answer is that both addressing schemes accomplish different functions:

- **Layer 2** uses **MAC addresses** and is responsible for packet delivery from **hop to hop**.
- **Layer 3** uses **IP addresses** and is responsible for packet delivery from **end to end**.

When a computer has data to send, it encapsulates it in a IP header which will include information like the Source and Destination IP addresses of the two “ends” of the communication.

The IP Header and Data are then further encapsulated in a MAC address header, which will include information like the Source and Destination MAC address of the current “hop” in the path towards the final destination.

Here is an illustration to drive this point home:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-l2-vs-l3.gif" alt="OSI Model - MAC vs IP" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-l2-vs-l3.gif)

Notice between each Router, the MAC address header is stripped and regenerated to get it to the next hop. The IP header generated by the first computer is only stripped off by the final computer, hence the IP header handled the “end to end” delivery, and each of the four *different* MAC headers involved in this animation handled the “hop to hop” delivery.

 

## OSI Layer 4 – Transport

The Transport layer of the OSI model is responsible for distinguishing network streams.

At any given time on a user’s computer there might be an Internet browser open, while music is being streamed, while a messenger or chat app is running. Each of these applications are sending and receiving data from the Internet, and all that data is arriving in the form of 1’s and 0’s on to that computer’s NIC.

Something has to exist in order to distinguish which 1’s and 0’s belong to the messenger or the browser or the streaming music. That “something” is Layer 4:

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-layer-4-1024x555.png" alt="OSI Model - Layer 4" style="zoom: 50%;" />

**Layer 4 accomplishes this by using an addressing scheme known as Port Numbers**.

Specifically, two methods of distinguishing network streams exist. They are known as the Transmission Control Protocol (TCP), or the User Datagram Protocol (UDP).

Both TCP and UDP have 65,536 port numbers (each), and a unique application stream is identified by both a Source and Destination port (in combination with their Source and Destination IP address).

TCP and UDP employ different strategies in how data streams are transferred, and their distinction and inner workings are both fascinating and significant, but unfortunately they are outside the scope of this article series. They will be the topic of a future article or series.

To summarize, if Layer 2 is responsible for *hop to hop* delivery, and Layer 3 is responsible for *end to end* delivery, it can be said that **Layer 4 is responsible for \*service to service\* delivery**.

 

## OSI Layer 5, 6, and 7

The Session, Presentation, and Application layers of the OSI model handle the final steps before the data transferred through the network (facilitated by layers 1-4) is displayed to the end user.

From a purely Network Engineering perspective, the distinction between Layers 5, 6, and 7 is not particularly significant. In fact, there is another popular Internet communication model known as the [TCP/IP model](http://www.tcpipguide.com/free/diagrams/tcpiplayers.png), which groups these three layers into one single encompassing layer.

The distinction would become more significant if you were involved in Software Engineering. But as this is not the focus of this article series, we will not dive deep into the differences between these layers.

Many network engineers simply refer to these layers as L5-7 or L5+ or L7. For the remainder of this series, we will do the same.

## Encapsulation and Decapsulation

The last item we need to discuss before we move on from the OSI Model is that of **Encapsulation** and **Decapsulation**. These terms refer to **how data is moved through the layers from top to bottom when sending and from bottom to top when receiving**.

As the data is handed from layer to layer, each layer adds the information it requires to accomplish its goal before the complete datagram is converted to 1s and 0s and sent across the wire. For example:

- Layer 4 will add a TCP header which would include a Source and Destination port
- Layer 3 will add an IP header which would include a Source and Destination IP address
- Layer 2 would add an Ethernet header which would include a Source and Destination MAC address

On the receiving end, each layer strips the header from the data and passes it back up the stack towards the Application layers. Here is the whole process in action:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-encap-decap.gif" alt="OSI Model - Encapsulation and De-Encapsulation" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-encap-decap.gif)

Note that this is only an example. The header that will be added will be dependent on the underlying communication protocol. For instance, a UDP header might be added at Layer 4 instead, or an IPv6 header might be added at Layer 3.

Either way, it is important to understand that as data is sent across the wire, it gets passed down the stack and each layer adds its own header to help it accomplish its goal. On the receiving end, the headers get stripped off one at a time, layer by layer, as the data is sent back up to the Application layer.

# Key Players

The Internet is a fascinating blend of many different elements that all work together to create a world wide *network of networks* which allow billions of different devices to communicate. In this article, we will look at some of the key players of the Internet and the role each fulfills in order to achieve network communication.

This list is far from exhaustive, but will cover the main “cast and crew” you will need to be familiar with in order to understand how a packet travels through the Internet.

## Host

The term **host** is a generic term that implies **any sort of end-device on the Internet**. Any device which might be the original initiation of traffic or the final destination of traffic can be considered a host.

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-host-l1.png" alt="Key Players - Hosts: Client and Server" style="zoom: 50%;" />

The traditional example would be your computer or laptop. But in these modern times, there are so many more: mobile phones, smart TVs, smart watches, certain cars, and even some [refrigerators](https://en.wikipedia.org/wiki/Internet_refrigerator)!

Hosts run software and applications for the end user to interact with, and they also at some point need to put bits on a wire. As such, it is said that Hosts operate across all seven layers of the OSI model.

In typical internet communication or network traffic, the two hosts in communication are often labeled as the Client or the Server.

The **Client is the entity initiating the request** and is looking to acquire a piece of information or data or a service. While the **Server is the entity receiving the request** and has the information, data, or service that the Client wants.

It should be noted that **these terms are relative** to specific types of communication.

For example, when your laptop is browsing through a web page, your laptop is acting as the *Client* and the Web Server is acting as the *Server*. But when that same Web Server is then downloading software updates, it is now acting as a *Client* and communicating with an Update *Server*.

## Network

**A Network is simply two or more connected devices** — typically grouped together by similar purposes or physical location. A network can take many different forms, for example:

- A group of PCs in a classroom are all in the same physical space and would all belong to one network.
- Any typical home network will include multiple laptops, mobile phones, or printers that are all tied to the same physical address. Therefore, all belonging to the same network.
- A coffee shop which has WiFi will allow each of their customers to connect to the same WiFi Network.
- A large company might use multiple networks, often separating them by job role. For instance, one network for all its accountants and another network for all its engineers.

Depending on the purpose of each network, the devices within them will then communicate with other devices in the *same* network or other devices in *different* networks.

Any time any of the Key Players discussed in this rest of this article series are connected to each other, you have a network. In fact, the whole ***Internet*** is nothing more than a series of ***Inter***-connected ***net***works.

## Switch

A **Switch** is a network device whose **primary purpose is to facilitate communication \*within\* networks**.

**Switches operate at Layer 2 of the OSI model**, which means they only look into each data-gram up to the Layer 2 header. The **Layer 2 header** contains information that enables [*hop to hop* delivery](https://www.practicalnetworking.net/series/packet-traveling/osi-model/#osi-layer-23), such as the **Source and Destination MAC address**.

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-switch-l2-1024x174.png" alt="Key Players - Switch" style="zoom:50%;" />

A Switch operates by maintaining what is known as a **MAC Address table**. This is a table that **maps MAC addresses of devices plugged into each switch port**. A typical switch has many ports, from 24 to 48, up to 96, or more.

The **MAC Address Table is populated by looking at the Source MAC** address field of any **received frames**.

In order to forward the frame, the Switch will **lookup the Destination MAC address in their MAC Address Table** to determine what port to use.

If a **Switch encounters a frame for which it does not know the location of the Destination MAC address, it simply duplicates and floods the frame out each switch port** (except the port it was received on). This process will be examined more closely in [another article](https://www.practicalnetworking.net/series/packet-traveling/host-to-host-through-a-switch/) in this series.

## Router

A **Router** is a network device whose **primary purpose is to facilitate communication \*between\* networks**. Each interface on a router creates a network boundary.

**Routers operate at Layer 3 of the OSI Model**, which means they only look into each datagram up to the Layer 3 header. The **Layer 3 header** contains information that enables [*end to end* delivery](https://www.practicalnetworking.net/series/packet-traveling/osi-model/#osi-layer-23), such as the **Source and Destination IP Address**.

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-router-l3-1024x213.png" alt="Key Players - Routers" style="zoom:50%;" />

In the image above, notice that the router on the left (R1) and the router on the right (R2) create three separate networks (11.11.11.x, 22.22.22.x, and 33.33.33.x). R1’s right interface and R2’s left interface are both on the same network.

The only way for the Client in the 11.11.11.x network to speak to the Server in the 33.33.33.x network is to forward the packet to R1, who will in turn forward the packet to R2, who will then finally forward the packet to the Server.

A Router accomplishes all this by maintaining what is known as a **Routing Table**. This is a table that contains paths to *all* the networks a Router knows how to reach. These paths are sometimes known as Routes, and each entry contains an IP Network and either an interface or the IP address of the next router in the path to the target.

There are multiple ways a Router can learn of a network and populate its Routing Table. We will look at some of those ways in a later article in this series.

Keep in mind, from the perspective of each router, the **Route Table is a map of \*every\* network that exists**. If a router receives a packet destined to a network it does not know about, then as far as that router is concerned, that network must not exist. Therefore, **when a router receives a packet destined to a network which is not in its Routing Table, that packet is discarded**.

## Address Resolution Protocol (ARP)

Earlier we discussed that MAC addresses are a Layer 2 addressing scheme. We also discussed that IP addresses are a Layer 3 addressing scheme.

<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-layer-2-3-arp.png" alt="Key Players - ARP links L2 and L3" style="zoom:50%;" />

What bridges these two addressing schemes is the **A**ddress **R**esolution **P**rotocol (**ARP**).

Typically, when two hosts are communicating, they already know each other’s IP address. They can know each other’s IP address from a variety of methods: sometimes it is manually provided by a user, sometimes by another protocol (often DNS). But the actual method employed is irrelevant (at least to this article series).

However, what is definitely *not* known is their MAC addresses. The hosts will use ARP to discover the appropriate MAC address. To put it another way, **ARP will use the *known* IP address, and discover the \*unknown\* MAC address**. The discovered mapping is then added and stored in an **ARP Table, which is a mapping of IP addresses to correlating MAC addresses**.

We’ll describe how L2 and L3 are bridged together, and ARP’s role in the process using the following illustration:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-arp-l2-l3-1024x256.png" alt="Key Players - ARP targets" style="zoom:67%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-arp-l2-l3.png)

In the image above, there are three networks: the purple network, the gray network, and the red network. We’ll use this diagram to illustrate two instances of ARP: First when a host is speaking to another host in the *same* network (Client to Purple server). And Second when a host is speaking to another host in a *different* network (Client to Red server).

When the Client needs to speak to the Purple Server, it will know the Purple Server’s IP address, and from that it will determine that the Purple Server exists in the *local* network. **When a Client is attempting to speak to a host in the same network, the Client will issue an ARP request for the host’s MAC address**.

ARP will allow the Client to complete the Layer 2 header as follows:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-packet-client-purple1-1024x109.png" alt="Key Players - Packet destined to local destination" style="zoom:50%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-packet-client-purple1.png)

When the Client needs to speak to the Red Server, it will know the Red Server’s IP address, and from that it will know that the Red Server exists in a *foreign* network. As such, the packet must be delivered to the nearest router — otherwise known as the Default Gateway.

The Client is generally already configured with a Default Gateway — which we can tell from the image will be the R1. **When a Client is attempting to speak to a host in a *foreign* network, the Client will issue an ARP request for the Default Gateway’s MAC address**.

This will allow the Client to populate the Layer 3 and Layer 2 headers as follows:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-packet-client-red1-1024x109.png" alt="Key Players - Packet destined to foreign destination" style="zoom:50%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-packet-client-red1.png)
To summarize ARP’s operation:

- When a Client is speaking to a host in the *same* network, it will ARP for the MAC address of the host
- When a Client is speaking to a host in a *different* network, it will ARP for the MAC address of the Default Gateway

Remember, packet delivery is always the job of Layer 2, and Layer 2’s primary goal is getting a packet from *hop* *to hop*. Conversely, Layer 3, which is concerned with *end to end* delivery is unable to put a packet on a wire and send it to another host’s NIC. ARP’s role is to help the client create the proper L2 header, based on the L3 header, in order to get the packet from one hop to the next.

It should also be noted that any device that intends to forward a packet based upon the IP address (L3), must also have the ability to deliver the packet to the next hop (L2). As such, any device that uses IP addresses must also use ARP to deliver the packet using MAC addresses. Consequently, all Layer 3 devices must maintain an ARP Table.

For another explanation of ARP and an illustration of the address resolution process in video form, [click here](https://www.practicalnetworking.net/series/arp/arp-in-5-minutes/).

## Summary

This article and the [previous](https://www.practicalnetworking.net/series/packet-traveling/osi-model/) covered a lot of ground on a variety of subjects that individually have entire books written about. This was intentionally done so that the next few articles in the series can bring everything together (and go a bit deeper than this article went). But it is crucial that all the tenants of these two articles be understood before moving forward.

In this article, we discussed the primary purposes of the different layers of the OSI model. Specifically:

- [OSI Layer **1**](https://www.practicalnetworking.net/series/packet-traveling/osi-model#osi-layer-1) is the **physical medium** carrying the **1’s and 0’s** across the wire
- [OSI Layer **2**](https://www.practicalnetworking.net/series/packet-traveling/osi-model#osi-layer-2) is responsible for ***hop to hop*** delivery and uses **MAC addresses**
- [OSI Layer **3**](https://www.practicalnetworking.net/series/packet-traveling/osi-model#osi-layer-3) is responsible for ***end to end*** delivery and uses **IP Addresses**
- [OSI Layer **4**](https://www.practicalnetworking.net/series/packet-traveling/osi-model#osi-layer-4) is responsible for ***service to service*** delivery and uses **Port Numbers**

We also discussed some of the Key Players involved in moving a packet through the Internet:

- **[Switches](https://www.practicalnetworking.net/series/packet-traveling/key-players/#switch)** facilitate communications ***within*** networks and operate at Layer **2**
- **[Routers](https://www.practicalnetworking.net/series/packet-traveling/key-players/#router)** facilitate communication ***between*** networks and operate at Layer **3**
- **[ARP](https://www.practicalnetworking.net/series/packet-traveling/key-players/#arp)** uses a ***known* IP** address **to resolve an *unknown* MAC** address

We also discussed three different tables that are use to store different mappings:

- Switches use a **[MAC Address Table](https://www.practicalnetworking.net/series/packet-traveling/key-players/#mac-table)** which is a mapping of **Switchports** to connected **MAC addresses**
- Routers use a **[Routing Table](https://www.practicalnetworking.net/series/packet-traveling/key-players/#routing-table)** which is a mapping of known **Networks** to **interfaces or next-hop addresses**
- All L3 devices use an **[ARP Table](https://www.practicalnetworking.net/series/packet-traveling/key-players/#arp-table)** which is a mapping of **IP Addresses** to **MAC addresses**

# Host to Host Communication

After discussing the makeup of the [OSI Model](https://www.practicalnetworking.net/series/packet-traveling/osi-model/) and some of the [Key Players](https://www.practicalnetworking.net/series/packet-traveling/key-players/) involved in moving a packet from one host to another, we can finally discuss the specific functions which occur in allowing Host to Host communication.

At the very core of the Internet is this idea that two computers can communicate with each other. Although it is rare to find situations where two hosts are connected directly to each other, understanding what happens if they were is crucial to understanding everything else that happens when multiple hosts are communicating through a switch or router.

As such, this article will focus on host to host communication, and each individual step involved in the process.

## Host to Host Communication

Since there are no Routers in this illustration, we know all the communication is happening within the same network — therefore, Host A and Host B are both configured with IP addresses that belong to the same network.

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-1-1024x129.png" alt="Host to Host Communication - Step 1" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-1.png)

Each host has a unique IP address and MAC address. Since each host is also a [L3](https://www.practicalnetworking.net/series/packet-traveling/osi-model/#osi-layer-3) device, they each also have an [ARP Table](https://www.practicalnetworking.net/series/packet-traveling/key-players/#arp-table). At the moment, their ARP Tables are empty.

Host A starts by generating some Data for Host B. Host A knows the final destination for this data will be the IP address 10.10.10.20 (Host B). Host A also knows its own address (10.10.10.10), and as such is able to create a L3 header with the required Source and Destination IP Address.

But as we learned earlier, [packet delivery is the job of Layer 2](https://www.practicalnetworking.net/series/packet-traveling/osi-model/#osi-layer-23), so despite these hosts being directly connected to one another, a L2 header must be created.

The Source of the L2 header will be Host A’s MAC address (aaaa.aaaa.aaaa). The Destination of the L2 header *should* be Host B’s MAC address, but at the moment, Host A doesn’t have an entry in its ARP Table for Host B’s IP address, and therefore, does not know Host B’s MAC address.

As a result, Host A is unable to create the proper L2 header to deliver the packet to Host B’s NIC at this time. Host A will have to initiate an ARP Request in order to acquire the missing information:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-2-1024x135.png" alt="Host to Host Communication - Step 2" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-2.png)

The ARP Request is a single packet which essentially asks: “*If there is someone out there with the IP 10.10.10.20, please send me your MAC address.*“

Remember, at this point Host A does not know if Host B exists. In fact, Host A does not know that it is directly connected to Host B. Hence, the question is addressed to *everyone* on the link. The **ARP Request is sent as a Broadcast**, and had there been other hosts connected to this link, they too would have received the ARP Request.

Also note that Host A includes its own MAC address in the ARP Request itself. This allows Host B (if it exists) to easily respond directly back to Host A with the requested information.

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-3-1024x133.png" alt="Host to Host Communication - Step 3" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-3.png)

Receiving the ARP Request allows Host B to learn something. Namely, that Host A’s IP address is 10.10.10.10 and the correlating MAC address is aaaa.aaaa.aaaa. Notice this entry is now added to Host B’s ARP Table.

Host B can use this new information to respond directly to Host A. The **ARP Response is sent as a Unicast** message, directly addressed to Host A. Had there been other hosts on this link, they would *not* have seen the ARP Response.

The ARP Response will include the information Host A requested: The IP Address 10.10.10.20 is being served by the NIC with the MAC address bbbb.bbbb.bbbb. Host A will use this information to populate its ARP Table:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-4-1024x129.png" alt="Host to Host Communication - Step 4" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hth-4.png)

With Host A’s ARP Table populated, Host A can now successfully put together the proper L2 header to get the packet to Host B.

When Host B gets the data, it will be able to respond without further ado, since it already has a mapping in its ARP Table for Host A.

# Host to Host through a Switch

In the last article, we looked at everything that happens for two hosts to communicate directly with one another. In this article, we will add a common network device: a switch. We will take a look at what happens for communication from Host to Host through a Switch.

This article will be the practical application of everything that was discussed when we looked at a [Switch](https://www.practicalnetworking.net/series/packet-traveling/key-players#switch) as a key player in packet traveling. It might be worth reviewing that section before proceeding.

We will start by looking at the individual switch functions, and then take a look at an animation which shows their collaborative operation.

## Switch Functions

A Switch primarily has four functions: Learning, Flooding, Forwarding, and Filtering:

### Learning

Being a [Layer 2](https://www.practicalnetworking.net/series/packet-traveling/osi-model/#osi-layer-2) device, a Switch will make all its decisions based upon information found in the L2 Header. Specifically, a Switch will use the Source MAC address and Destination MAC address to make its forwarding decisions.

One of the goals of the Switch is to create a **MAC Address Table**, mapping each of its **switchports to the MAC address** of the connected devices.

The MAC address table starts out empty, and every time a Switch receives anything, it takes a look at the Source MAC address field of the incoming frame. It uses the Source MAC and the switchport the frame was received on to build an entry in the MAC Address Table.

Sooner or later, as each connected device inevitably sends something, the Switch will have a fully populated MAC Address Table. This table can then be used to smartly forward frames to their intended destination.

### Flooding

However, despite the learning process above, it is unavoidable that a Switch will at some point receive a frame destined to a MAC address of which the Switch does not know the location.

In such cases, the Switch’s only option is to simply duplicate the frame and send it out *all* ports. This action is known as Flooding.

Flooding assures that *if* the intended device exists and *if* it is connected to the switch, it will definitely receive the frame.

Of course, so will every other device connected to that particular Switch. And though not ideal, this is perfectly normal. The NIC of each connected device will receive the frame and take a look at the Destination MAC address field. If they are not the intended recipient, they will simply silently drop the frame.

If they *are* the intended device, however, then the Switch can rest satisfied knowing it was able to deliver the frame successfully.

Moreover, when the intended device receives the frame, a response will be generated, which when sent to the Switch will allow the switch to learn and create a MAC Address Table mapping that unknown device to its switchport.

### Forwarding

Ideally, of course, the Switch will have an entry in its MAC Address Table for every Destination MAC it comes across.

When this happens, the Switch happily forwards the frame out the appropriate switchport.

There are three methods by which a Switch can forward frames. They are briefly described below.

- **Store and Forward** – The Switch copies the entire frame (header + data) into a memory buffer and inspects the frame for errors before forwarding it along. This method is the slowest, but allows for the best error detection and additional features like prioritizing certain types of traffic for faster processing.
- **Cut-Through** – The Switch stores nothing, and inspects only the bare minimum required to read the Destination MAC address and forward the frame. This method is the quickest, but provides no error detection or potential for additional features.
- **Fragment Free** – This method is a blend of the prior two. The Switch inspects only the first portion of the frame (64 bytes) before forwarding the frame along. If a transmission error occurred, it is typically noticed within the first 64 bytes. As such, this method provides “good enough” error detection, while gaining the speed and efficiency of avoiding storing the entire frame in its memory before forwarding it.

It is worth pointing out that these three methods were at one point very significant when Switch technologies were newer and switching induced noticeable latency. In modern days, with line-speed switching, the difference in speed between these three is negligible, and most switches operate in Store and Forward mode.

### Filtering

And finally, the last function of the switch is filtering. Mainly, this function states that a Switch will never forward a frame back out the same port which received the frame.

Most commonly, this happens when a Switch needs to flood a frame — the frame will get duplicated and sent out every switchport *except the switchport which received the frame*.

Rarely, a host will send a frame with a destination MAC address of itself. This is usually a host experiencing some sort of error condition or being malicious. Either way, when this happens, the Switch simply discards the frame.

## Switch Operation

Now that we’ve looked at each of the individual functions of a Switch, we can look at them in action. The animation below includes a Switch going through all four functions as it processes traffic.

Ordinarily, the hosts in the animation below would need to perform an [ARP resolution](https://www.youtube.com/watch?v=QPi5Nvxaosw), but for the sake of focusing on the Switch’s operation, we will omit ARP and proceed as if all the hosts already knew each other’s IP and MAC addresses.

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-host-switch-host.gif" alt="Host to Host through a Switch - Switch Functions animation" style="zoom:67%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-host-switch-host.gif)

Host A has “something” to send to Host B. The contents of the “something” is entirely irrelevant, so long as its understood that the frame has a L2 header which includes a Source and Destination MAC address.

Initially, the MAC Address Table of the Switch is empty. Remember, it only gets populated when a frame is received.

When Host A sends the frame to the switch, it includes a Source MAC address of aaaa.aaaa.aaaa. This prompts the Switch to **learn** a MAC Address Table entry mapping Port 1 to MAC Address aaaa.aaaa.aaaa.

Then, when deciding how to forward the frame, the Switch realizes there is no entry for bbbb.bbbb.bbbb. This leaves the Switch only one option: duplicate and **flood** the frame out all ports. Notice the frame was duplicated out all ports, except Port 1 (the port it came in on) – this is an example of the Switch performing its **filtering** function.

This frame will then be received by Host C and Host B. Host C, when inspecting the L2 header will realize the frame is not intended for them and will simply discard it. Conversely, when Host B receives the frame and realizes they indeed are the intended recipient, they will accept the frame and generate a response.

When the response arrives on the Switch, another MAC Address Table mapping can be **learned**: Port 2 contains the MAC address bbbb.bbbb.bbbb.

Then the Switch looks up the Destination MAC address (aaaa.aaaa.aaaa) and realizes this address exists out Port 1. The Switch can then simply **forward** the frame, since it knows the location of the Destination MAC address.

The animation above illustrate the four switch functions on a *single* switch. To see how the process scales to *multiple* switches, check out [this article](https://www.practicalnetworking.net/stand-alone/communication-through-multiple-switches/).

### Broadcasts

There is often some confusion about a switch in regards to a Broadcast and a Switch’s flooding behavior. The confusion is understandable, because the end result is the same, but it is also important to understand the distinction.

A **Broadcast frame is a frame which is addressed to \*everyone\* on the local network**. This is done using the same Ethernet header we’ve been discussing, except the Destination MAC address field is populated with a special address: ffff.ffff.ffff. The “all F’s” address is specially reserved for the purpose of broadcasting.

By definition, if the Switch ever encounters a packet with a destination MAC of ffff.ffff.ffff, it will always flood the frame (after learning the Source MAC, of course).

Another way of looking at it, is since the address ffff.ffff.ffff is reserved, the switch is unable to learn a MAC Address Table mapping for it. As such, any frame destined to this MAC address will always be flooded.

In summary, a Broadcast is a frame addressed to everyone on the local network (ffff.ffff.ffff), and Flooding is an action a switch can take. A broadcast frame, by definition, will always be flooded by a switch. But a switch will never broadcast a frame (since broadcasting is not a function of a switch).

# Host to Host through a Router

We’ve looked at what it takes for [two hosts directly connected to each other](https://www.practicalnetworking.net/series/packet-traveling/host-to-host/) to communicate. And we’ve looked at what it takes for a host to speak to another host [through a switch](https://www.practicalnetworking.net/series/packet-traveling/host-to-host-through-a-switch/). Now we add another network device as we look at what it takes for traffic to pass from host to host through a Router.

This article will be the practical application of everything that was discussed when we looked at a [Router](https://www.practicalnetworking.net/series/packet-traveling/key-players#router) as a key player in Packet Traveling. It might be worth reviewing that section before proceeding.

We will start by looking at the two major Router Functions, then see them in action as we look at Router Operation.

To discuss our way through these concepts, we will use the following image. We will focus on R1, and what is required for it to forward packets from Host A, to Host B and Host C.

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-initial-1024x212.png" alt="Router Operation" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-initial.png)

For simplicity, the MAC addresses of each NIC will be abbreviated to just four hex digits.

## Router Functions

Earlier we mentioned that a Router’s primary purpose is to facilitate communication *between* networks. As such, every router creates a boundary between two networks, and their main role is to forward packets from one network to the next.

Notice in the image above, we have R1 creating a boundary between the 11.11.11.x network and the 22.22.22.x network. And we have R2 creating a boundary between the 22.22.22.x and 33.33.33.x networks. Both of the routers have an interface in the 22.22.22.x network.

In order to forward packets between networks, a router must perform two functions: populate and maintain a Routing Table, and populate and maintain an ARP Table.

### Populating a Routing Table

From the perspective of each Router, the **Routing Table is the map of \*all\* networks in existence**. The Routing Table starts empty, and is populated as the Router learns of new routes to each network.

There are multiple ways a Router can learn the routes to each network. We will discuss two of them in this section.

The simplest method is what is known as a **Directly Connected** route. Essentially, when a Router interface is configured with a particular IP address, the **Router will know the Network to which it is directly attached**.

For example, in the image above, R1’s left interface is configured with the IP address 11.11.11.1. This tells R1 the location of the 11.11.11.x network exists out its left interface. In the same way, R1 learns that the 22.22.22.x network is located on its right interface.

Of course, a Router can not be directly connected to *every* network. Notice in the image above, R1 is not connected to 33.33.33.x, but it is very likely it might have to one day forward a packet to that network. Therefore, there must exist another way of learning networks, beyond simply what the router is directly connected to.

That other way is known as a **Static Route**. A Static Route is a route which is **manually configured by an administrator**. It would be as if you explicitly told R1 that the 33.33.33.x network exists behind R2, and to get to it, R1 has to send packets to R2’s interface (configured with the IP address 22.22.22.2).

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-routing-table-300x130.png" alt="Router Operation - Routing Table" style="zoom: 80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-routing-table.png)

In the end, after R1 learned of the two Directly Connected routes, and after R1 was configured with the one Static Route, R1 would have a Routing Table that looked like this image.

The **Routing Table** is populated with many Routes. Each **Route** contains a **mapping of Networks to Interfaces or Next-Hop addresses**.

Every time a Router receives a packet, it will consult its Routing Table to determine how to forward the packet.

Again, the Routing Table is a map of *every* network that exists (from the perspective of each router). If a router receives a packet destined to a network it does not have a route for, then as far as that router is concerned, that network must not exist. Therefore, **a router will discard a packet if its destination is in a network not in the Routing Table**.

Finally, there is a third method for learning routes known as **Dynamic Routing**. This involves the **routers detecting and speaking to one another automatically to inform each other of their known routes**. There are various protocols that can be used for Dynamic Routing, each representing different strategies, but alas their intricacies fall outside the scope of this article series. They will undoubtedly become a subject for future articles.

That said, the Routing Table will tell the router which IP address to forward the packet to next. But as we learned earlier, packet delivery is always the job of Layer 2. And in order for the Router to create the L2 Header which will get the packet to the next L3 address, the Router must maintain an [ARP Table](https://www.practicalnetworking.net/series/packet-traveling/key-players#arp-table).

### Populating an ARP Table

The [**A**ddress **R**esolution **P**rotocol (**ARP**)](https://www.practicalnetworking.net/series/packet-traveling/key-players#arp) is the bridge between Layer 3 and Layer 2. When provided with an IP address, ARP resolves the correlating MAC address. Devices employ ARP to populate an ARP Table, or sometimes called an ARP Cache, which is a mapping of IP address to MAC addresses.

A router will use its Routing Table to determine the next IP address which should receive a packet. If the Route indicates the destination exists on a directly connected network, then the “next IP address” is the Destination IP address of the packet – the final hop for that packet.

Either way, the **Router will use a L2 header as the vessel to deliver the packet to the correct NIC**.

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-arp-table-300x149.png" alt="Router Operation - ARP Table" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-arp-table.png)

Unlike the Routing Table, the ARP Table is populated ‘as needed’. Which means in the image above, R1 will not initiate an ARP Request for Host B’s MAC address until it has a packet which must be delivered to Host B.

But as we discussed before, an ARP Table is simply a mapping of IP addresses to MAC addresses. When R1’s ARP Table will be fully populated, it will look like this image.

Once again, for simplicity, the images in this article are simply using four hex digits for the MAC addresses. In reality, a MAC address is 12 hex digits long. If its easier, you can simply repeat the four-digit hex MAC address three times, giving R2’s left interface a “real” MAC address of bb22.bb22.bb22.

## Router Operation

With the understanding of how a Router populates its Routing Table and how a Router intends to populate its ARP Table, we can now look at how how these two tables are used practically for a Router to facilitate communication between networks.

In R1’s Routing Table above, you can see there are two type of routes: some that point to an Interface, and some that point to a Next-Hop IP address. We’ll frame our discussion around a Router’s operation around these two possibilities.

But first, we will discuss how Host A delivers the packet to its Default Gateway (R1). Then we will look at what R1 does with a packet sent from Host A to Host B, and then another packet that was sent from Host A to Host C.

### Host A getting the Packet to R1

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-route-first-hop-300x240.png" alt="Router Operation - Host to First Hop" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-route-first-hop.png)

In both cases, Host A is communicating with two hosts on foreign networks. Therefore, Host A will need to get either packet to its default gateway — R1.

Host A will create the L3 header with a Source IP address of 11.11.11.77, and a Destination IP address of 22.22.22.88 (for Host B) or 33.33.33.99 (for Host C). This L3 header will serve the purpose of getting the data from ‘end to end’.

But that L3 header won’t be enough to deliver the packet to R1. [Something else](https://www.practicalnetworking.net/series/packet-traveling/osi-model#osi-layer-23) will have to be used.

Host A will then [encapsulate](https://www.practicalnetworking.net/series/packet-traveling/osi-model#encap-decap) the L3 header in a L2 header which will include a Source MAC address of aaaa.aaa.aaaa and a Destination MAC address of aa11.aa11.aa11 — the MAC address which identifies R1’s NIC. This L2 header will serve the purpose of delivering the packet across the first hop.

Host A will have already been configured with its Default Gateway’s IP address, and hopefully Host A will have already communicated with foreign hosts. As such, Host A more than likely already had an [ARP Table](https://www.practicalnetworking.net/series/packet-traveling/key-players#arp-table) entry with R1’s MAC address. Conversely, if this was Host A’s first communication with a foreign host, forming the L2 header would have been preceded with an [ARP Request to discover R1’s MAC address](https://www.practicalnetworking.net/series/packet-traveling/key-players#arp-target).

At this point, R1 will have the packet. The Destination IP address of the packet will either be 22.22.22.88 for the communication sent to Host B, or 33.33.33.99 for the communication sent to Host C. Both of those destinations exist in [R1’s Routing Table](https://www.practicalnetworking.net/series/packet-traveling/host-to-host-through-a-router/#R1-routing-table) — the difference is one Route points to an Interface and the other Route points to a Next-Hop IP.

### Routes pointing to an Interface

A Route in a Routing Table that points to an Interface was typically learned because the Router was Directly Connected to the network. If a packet’s Destination IP address is in a network which is directly connected to the router, the Router knows they are responsible for delivering the packet to its final hop.

The process is similar to what has been discussed before. The Router uses the L3 header information to determine where to send the packet next, then creates a L2 header to get it there. In this case, the next (and final) hop this packet must take is to the NIC on Host B.

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-route-interface-1024x214.png" alt="Router Operation - Local Delivery " style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-route-interface.png)

The L3 header will remain unchanged — it is identical to the L3 header created by Host A.

What is different, is the L2 header. Notice the Source MAC address is bb11.bb11.bb11 — R1’s right interface MAC address. The old L2 header which Host A had created to get the packet to R1 was stripped off, and a new L2 header was generated (by R1) to deliver it to the next NIC.

The Destination MAC address is, of course, bbbb.bbbb.bbbb — the MAC address for Host B.

### Routes pointing to a Next-Hop address

For the packet from Host A sent to Host C, the Destination IP address will be 33.33.33.99. When R1 consults its Routing Table, it will determine that the next-hop for the 33.33.33.x network exists at the IP address 22.22.22.2 — R2’s left interface IP address.

Effectively, this tells R1 to use a L2 header which will get the packet to R2 in order to continue forwarding this packet along its way.

Since the current “hop” is between R1 and R2, their MAC addresses will make up the Source and Destination MAC addresses:

[<img src="https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-route-nexthop1-1024x212.png" alt="Router Operation - Foreign Delivery" style="zoom:80%;" />](https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-hhr-route-nexthop1.png)

Again, the L3 header remains unchanged, it includes the same Source and Destination IP addresses initially set by Host A — these addresses represent the two “ends” of the communication. The L2 header, however, is completely regenerated at each hop.

Should R1 not have R2’s MAC address, it would simply initiate an ARP Request for the IP address in the route: 22.22.22.2. From then on, it will have no problems creating the proper L2 header which will get the packet from R1 to R2.

As the process continues, R2 will finally receive the packet, and then be faced with the same situation that R1 was in for the example above — deliver the packet to its final hop.

This process can be continued as needed. Had Host A been trying to speak to Host X which had 10 routers in the path, the process would have been identical. Each transit Router in the path would have a Route mapping Host X’s network to the next-hop IP in the path. Until the final router which would be directly connected to the network Host X resided in. And that final router would be responsible for delivering the packet to its final hop — Host X itself.