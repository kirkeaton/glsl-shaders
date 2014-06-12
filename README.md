GLSL Shaders
============

### Description
Three shaders (Gouraud, Phong, and Blinn-Phong) writting in the OpenGL Shading Language. Completed for the course "CIS*4800 - Computer Graphics" during the Winter '14 semester.

### Usage
To learn how to use the following shaders, please read the tutorial found at, [Lighthouse 3D](http://www.lighthouse3d.com/tutorials/glsl-tutorial/)

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
    N•L  - the dot product of the normal for the point and L is the vetor pointing to the light
        

