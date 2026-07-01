GLSL Shaders
============

### Description
Three shaders (Gouraud, Phong, and Blinn-Phong) written in the OpenGL Shading Language.

### Running this again
The original project used old fixed-function OpenGL shader syntax, which is no longer practical to run directly on modern systems. I set up a lightweight browser-based version so you can view the three lighting models again without needing legacy OpenGL tools.

1. Open a terminal in this folder.
2. Start a local web server:
   `python3 -m http.server 8000`
3. Open http://localhost:8000 in your browser.
4. Use the dropdown to switch between Gouraud, Phong, and Blinn-Phong.

### Illumination Equation
All of the programmable shaders use the following equation to determine the light intensity for each vertex or pixel.

    Iλ = Iaλ * ka * Oaλ + fatt * Ipλ * kd * Odλ * (N•L)
    where

    Iλ   - light value
    Iaλ  - ambient light value
    ka   - ambient reflection coefficient
    Oaλ  - ambient light colour
    fatt - the light source attenuation value
    Ipλ  - point light value
    kd   - diffuse reflection coefficient
    Odλ  - object colour
    N•L  - the dot product of the normal for the point and L is the vector pointing to the light
        

