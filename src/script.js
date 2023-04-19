import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// galaxy
const parameters = {
}

parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 12;
parameters.branches = 3;
parameters.spin = 0.9;
parameters.randomness = 0.197;
parameters.randomnessPower = 2;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';

let geometry = null;
let material = null;
let mesh = null;

const generateGalaxy = () => {
    // remove old geometries if they already exist
    if(mesh !== null){
        geometry.dispose();
        material.dispose();
        scene.remove(mesh);
    }
    // geometry
    geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( parameters.count * 3 ); // positions for geometry
    const colors = new Float32Array( parameters.count * 3 )

    // material
    material = new THREE.PointsMaterial({
        color: parameters.colour,
        size: parameters.size,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    // create the mesh
    mesh = new THREE.Points(geometry, material);
    scene.add(mesh);

    // create vertices points and color
    for (let i=0; i < vertices.length; i++){

        const i3 = i * 3 // sets of 3 for each vertices

        // position
        const radius = Math.random() * parameters.radius // 0 - 5, used to get a value on the defined radius width

        // user math.pow so we can control distribution of points around 0 line
        // get Math.pow(random num, power of randomPowerNum) & * randomly multipy by 1 or -1 (to create an even mix of positive & negative nums)
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
       
        const branchAngle = (i % parameters.branches) / parameters.branches * (Math.PI * 2) // get angle for each branch (33, 66) divide by branch num to get % of 1
        const spinAngle = radius * parameters.spin // the higher the radius, the further away from 0 the point will be (further away from galaxy)

        // color
        const insideColor = new THREE.Color(parameters.insideColor);
        const outsideColor = new THREE.Color(parameters.outsideColor);
        const mixedColor = insideColor.clone();

        mixedColor.lerp(outsideColor, radius/parameters.radius)

        colors[i3  ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        if(i<20){
            console.log(radius/parameters.radius);
        }
        /// vertices, x, y, z position. we use PI as we want a cirlce. we use cos and sin so we get  circle.
        vertices[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        vertices[i3 + 1] = randomY
        vertices[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
    }

    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
    geometry.setAttribute('color', new THREE.BufferAttribute( colors, 3 ));

}

generateGalaxy()

// gui
gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.7).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(5).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-1).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(-0.5).max(1.5).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(5).step(1).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()