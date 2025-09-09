// 获取DOM元素
const startScreen = document.getElementById('start-screen');
const mainScreen = document.getElementById('main-screen');
const videoContainer = document.getElementById('video-container');
const enterBtn = document.getElementById('enter-btn');
const moonBtn = document.getElementById('moon-btn');
const fallBtn = document.getElementById('fall-btn');
const futureBtn = document.getElementById('future-btn');
const backBtn = document.getElementById('back-btn');
const fullscreenVideo = document.getElementById('fullscreen-video');
const canvasContainer = document.getElementById('canvas-container');
const blackholeCanvas = document.getElementById('blackhole-canvas');
const particleContainer = document.querySelector('.particle-container');

// 直接显示初始页面
setTimeout(() => {
    startScreen.style.display = 'flex';
    initBlackholeBackground(); // 初始化黑洞背景
    createAbsorptionParticles(); // 创建吸收效果粒子
}, 100);

// 进入主界面
enterBtn.addEventListener('click', () => {
    // 添加过渡动画
    gsap.to(startScreen, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            startScreen.style.display = 'none';
            mainScreen.style.display = 'block';
            initThreeJS(); // 初始化3D场景
        }
    });
});

// 视频播放功能
moonBtn.addEventListener('click', () => {
    playVideo('video/月宫.mp4');
});

fallBtn.addEventListener('click', () => {
    playVideo('video/陨落.mp4');
});

futureBtn.addEventListener('click', () => {
    playVideo('video/未来.mp4');
});

// 播放视频函数 - 支持懒加载
function playVideo(videoSrc) {
    // 添加视频过渡动画
    gsap.to(mainScreen, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            fullscreenVideo.dataset.src = videoSrc; // 使用data-src属性存储视频源
            
            // 手动触发懒加载逻辑
            const tempVideo = document.createElement('video');
            tempVideo.src = videoSrc;
            tempVideo.preload = 'metadata';
            
            tempVideo.addEventListener('loadedmetadata', () => {
                fullscreenVideo.src = videoSrc;
                fullscreenVideo.load();
                fullscreenVideo.play();
                mainScreen.style.display = 'none';
                videoContainer.style.display = 'block';
                
                // 视频容器淡入
                gsap.fromTo(videoContainer, {
                    opacity: 0
                }, {
                    opacity: 1,
                    duration: 0.5
                });
            });
        }
    });
}

// 返回主界面 - 增强版
backBtn.addEventListener('click', () => {
    gsap.to(videoContainer, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            videoContainer.style.display = 'none';
            mainScreen.style.display = 'block';
            fullscreenVideo.pause();
            fullscreenVideo.src = '';
            
            // 主界面淡入
            gsap.fromTo(mainScreen, {
                opacity: 0
            }, {
                opacity: 1,
                duration: 0.5
            });
        }
    });
});

// 初始化黑洞背景
function initBlackholeBackground() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    blackholeCanvas.appendChild(renderer.domElement);
    
    camera.position.z = 5;
    
    // 创建黑洞主体
    const blackHoleGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.95
    });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);
    
    // 创建吸积盘
    const accretionDiskGeometry = new THREE.RingGeometry(1.8, 3, 64);
    const accretionDiskMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });
    const accretionDisk = new THREE.Mesh(accretionDiskGeometry, accretionDiskMaterial);
    accretionDisk.rotation.x = Math.PI / 2;
    scene.add(accretionDisk);
    
    // 创建黑洞周围的光晕
    const glowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x330000,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    
    // 创建一些背景星星
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 3000;
    const posArray = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 1000;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8
    });
    
    const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starsMesh);
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 旋转吸积盘
        accretionDisk.rotation.z += 0.002;
        
        // 脉冲效果
        const pulseFactor = 0.5 + Math.sin(Date.now() * 0.001) * 0.2;
        accretionDisk.material.opacity = 0.5 * pulseFactor;
        glow.material.opacity = 0.2 + Math.sin(Date.now() * 0.001 + Math.PI / 2) * 0.1;
        
        // 星星闪烁效果
        if (Math.random() > 0.99) {
            starsMaterial.opacity = 0.5 + Math.random() * 0.5;
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// 创建黑洞吸收效果粒子
function createAbsorptionParticles() {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = `rgba(${200 + Math.random() * 55}, ${Math.random() * 100}, ${Math.random() * 100}, ${0.5 + Math.random() * 0.5})`;
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px rgba(${200 + Math.random() * 55}, ${Math.random() * 100}, ${Math.random() * 100}, 0.8)`;
        
        // 随机初始位置
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        particleContainer.appendChild(particle);
        
        // 黑洞中心位置
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // 粒子动画
        const duration = 5 + Math.random() * 10;
        const delay = Math.random() * 5;
        
        gsap.to(particle, {
            left: `${centerX}px`,
            top: `${centerY}px`,
            scale: 0,
            opacity: 0,
            duration: duration,
            delay: delay,
            ease: 'power2.in',
            onComplete: () => {
                particle.remove();
                // 重新创建粒子
                setTimeout(createParticle, Math.random() * 2000);
            }
        });
    }
}

// 创建多彩色线条随机流动效果
function createFlowLines(scene) {
    const flowGroup = new THREE.Group();
    scene.add(flowGroup);
    
    // 线条数量
    const lineCount = 100;
    const lines = [];
    
    // 随机颜色数组
    const colors = [
        0xff0000, 0xff8800, 0xffff00, 0x00ff00, 
        0x00ffff, 0x0088ff, 0x0000ff, 0xff00ff
    ];
    
    // 创建多条线条
    for (let i = 0; i < lineCount; i++) {
        // 随机选择线条颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 创建线条几何体
        const pointsCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(pointsCount * 3);
        const colorsArray = new Float32Array(pointsCount * 3);
        
        // 为每条线生成随机起点和终点
        const startX = (Math.random() - 0.5) * 1000;
        const startY = (Math.random() - 0.5) * 1000;
        const startZ = (Math.random() - 0.5) * 1000;
        const endX = (Math.random() - 0.5) * 1000;
        const endY = (Math.random() - 0.5) * 1000;
        const endZ = (Math.random() - 0.5) * 1000;
        
        // 将HEX颜色转换为RGB
        const r = ((color >> 16) & 255) / 255;
        const g = ((color >> 8) & 255) / 255;
        const b = (color & 255) / 255;
        
        // 生成线条上的点
        for (let j = 0; j < pointsCount; j++) {
            const t = j / (pointsCount - 1);
            
            // 贝塞尔曲线或简单插值
            const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 100;
            const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 100;
            const z = startZ + (endZ - startZ) * t + (Math.random() - 0.5) * 100;
            
            positions[j * 3] = x;
            positions[j * 3 + 1] = y;
            positions[j * 3 + 2] = z;
            
            // 设置每个点的颜色
            colorsArray[j * 3] = r;
            colorsArray[j * 3 + 1] = g;
            colorsArray[j * 3 + 2] = b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        
        // 创建线条材质
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        const line = new THREE.Line(geometry, material);
        
        // 存储线条的流动信息
        line.userData = {
            speed: 0.001 + Math.random() * 0.003,
            offset: Math.random() * Math.PI * 2
        };
        
        flowGroup.add(line);
        lines.push(line);
    }
    
    // 存储线条以便更新
    scene.userData.flowLines = lines;
    
    return flowGroup;
}

// 初始化ThreeJS 3D场景 - 增强版
function initThreeJS() {
    // 创建场景
    const scene = new THREE.Scene();
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);
    canvasContainer.appendChild(renderer.domElement);
    
    // 创建黑洞
    const blackHole = createBlackHole();
    scene.add(blackHole);
    
    // 创建星球
    const planets = createPlanets();
    planets.forEach(planet => {
        scene.add(planet);
    });
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambientLight);
    
    // 添加点光源以增强星球和黑洞的视觉效果
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // 创建轨道控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    // 创建多彩色线条随机流动效果
    createFlowLines(scene);
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 旋转星球
        planets.forEach((planet, index) => {
            planet.rotation.y += 0.001 * (index + 1);
            // 添加轨道运动
            if (planet.userData.orbit) {
                const time = Date.now() * 0.0001;
                planet.position.x = Math.cos(time * (index + 1) * 0.5) * planet.userData.orbit.radius;
                planet.position.z = Math.sin(time * (index + 1) * 0.5) * planet.userData.orbit.radius;
            }
        });
        
        // 更新黑洞效果
        updateBlackHole(blackHole);
        
        // 更新多彩流动线条效果
        if (scene.userData.flowLines) {
            const time = Date.now() * 0.001;
            scene.userData.flowLines.forEach(line => {
                // 获取线条的位置数据
                const positions = line.geometry.attributes.position.array;
                const pointsCount = positions.length / 3;
                
                // 更新每条线条的流动效果
                const userData = line.userData;
                const flowOffset = Math.sin(time * userData.speed + userData.offset) * 0.5 + 0.5;
                
                // 更新线条透明度，创建流动效果
                line.material.opacity = 0.3 + flowOffset * 0.3;
                
                // 为线条添加轻微的摆动效果
                for (let i = 0; i < pointsCount; i++) {
                    const index = i * 3;
                    positions[index + 1] += (Math.random() - 0.5) * 0.5;
                    positions[index + 2] += (Math.random() - 0.5) * 0.5;
                }
                
                line.geometry.attributes.position.needsUpdate = true;
            });
        }
        
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// 更新星云效果 - 已修改为不影响背景
function updateNebula(scene) {
    // 此函数已不再使用，因为我们改用了多彩色线条流动效果
}

// 创建黑洞 - 增强版
function createBlackHole() {
    const blackHoleGroup = new THREE.Group();
    
    // 黑洞主体
    const blackHoleGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.98
    });
    const blackHoleMesh = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    
    // 黑洞吸积盘 - 多层结构
    // 内层吸积盘
    const innerDiskGeometry = new THREE.RingGeometry(1.3, 1.8, 64);
    const innerDiskMaterial = new THREE.MeshBasicMaterial({
        color: 0xff9900,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const innerDiskMesh = new THREE.Mesh(innerDiskGeometry, innerDiskMaterial);
    innerDiskMesh.rotation.x = Math.PI / 2;
    
    // 外层吸积盘
    const outerDiskGeometry = new THREE.RingGeometry(1.8, 2.5, 64);
    const outerDiskMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });
    const outerDiskMesh = new THREE.Mesh(outerDiskGeometry, outerDiskMaterial);
    outerDiskMesh.rotation.x = Math.PI / 2;
    
    // 黑洞光环 - 多层结构
    const glow1Geometry = new THREE.SphereGeometry(2, 32, 32);
    const glow1Material = new THREE.MeshBasicMaterial({
        color: 0x330000,
        transparent: true,
        opacity: 0.3
    });
    const glow1Mesh = new THREE.Mesh(glow1Geometry, glow1Material);
    
    const glow2Geometry = new THREE.SphereGeometry(2.5, 32, 32);
    const glow2Material = new THREE.MeshBasicMaterial({
        color: 0x220000,
        transparent: true,
        opacity: 0.15
    });
    const glow2Mesh = new THREE.Mesh(glow2Geometry, glow2Material);
    
    // 添加扭曲效果的光环（模拟引力透镜）
    const lensEffectGeometry = new THREE.RingGeometry(2.5, 3.5, 64);
    const lensEffectMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1
    });
    const lensEffectMesh = new THREE.Mesh(lensEffectGeometry, lensEffectMaterial);
    lensEffectMesh.rotation.x = Math.PI / 2;
    
    // 组合所有黑洞组件
    blackHoleGroup.add(blackHoleMesh);
    blackHoleGroup.add(innerDiskMesh);
    blackHoleGroup.add(outerDiskMesh);
    blackHoleGroup.add(glow1Mesh);
    blackHoleGroup.add(glow2Mesh);
    blackHoleGroup.add(lensEffectMesh);
    
    // 存储黑洞相关对象以便更新
    blackHoleGroup.userData = {
        innerDisk: innerDiskMesh,
        outerDisk: outerDiskMesh,
        glow1: glow1Mesh,
        glow2: glow2Mesh,
        lensEffect: lensEffectMesh,
        pulseTime: 0
    };
    
    return blackHoleGroup;
}

// 更新黑洞效果 - 增强版
function updateBlackHole(blackHole) {
    const data = blackHole.userData;
    data.pulseTime += 0.02;
    
    // 黑洞吸积盘脉冲效果
    const pulseIntensity = 0.5 + Math.sin(data.pulseTime) * 0.2;
    data.innerDisk.material.opacity = 0.8 * pulseIntensity;
    data.outerDisk.material.opacity = 0.6 * pulseIntensity;
    
    // 黑洞光环脉冲效果，使用不同相位以增强视觉效果
    data.glow1.material.opacity = 0.2 + Math.sin(data.pulseTime + Math.PI / 2) * 0.1;
    data.glow2.material.opacity = 0.1 + Math.sin(data.pulseTime + Math.PI) * 0.05;
    
    // 引力透镜效果闪烁
    data.lensEffect.material.opacity = 0.05 + Math.sin(data.pulseTime * 1.5) * 0.05;
    
    // 旋转吸积盘，使用不同速度以增强层次感
    data.innerDisk.rotation.z += 0.008;
    data.outerDisk.rotation.z += 0.004;
    data.lensEffect.rotation.z += 0.002;
}

// 创建装饰星球 - 增强版
function createPlanets() {
    const planets = [];
    
    // 星球1 - 蓝色星球（带光环）
    const planet1Group = new THREE.Group();
    const planet1Geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const planet1Material = new THREE.MeshBasicMaterial({ color: 0x4488ff });
    const planet1 = new THREE.Mesh(planet1Geometry, planet1Material);
    
    // 添加星球光环
    const ringGeometry = new THREE.RingGeometry(0.7, 0.8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x88aaff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    
    planet1Group.add(planet1);
    planet1Group.add(ringMesh);
    planet1Group.position.set(5, 0, 0);
    
    // 添加轨道数据
    planet1Group.userData.orbit = {
        radius: 5
    };
    
    planets.push(planet1Group);
    
    // 星球2 - 红色星球
    const planet2Geometry = new THREE.SphereGeometry(0.4, 32, 32);
    const planet2Material = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const planet2 = new THREE.Mesh(planet2Geometry, planet2Material);
    planet2.position.set(-4, 1, 2);
    
    // 添加轨道数据
    planet2.userData.orbit = {
        radius: 4
    };
    
    planets.push(planet2);
    
    // 星球3 - 绿色星球
    const planet3Geometry = new THREE.SphereGeometry(0.35, 32, 32);
    const planet3Material = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
    const planet3 = new THREE.Mesh(planet3Geometry, planet3Material);
    planet3.position.set(0, -3, -3);
    
    // 添加轨道数据
    planet3.userData.orbit = {
        radius: 3
    };
    
    planets.push(planet3);
    
    // 小型行星和小行星
    const smallPlanetGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const smallPlanetMaterial1 = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const smallPlanet1 = new THREE.Mesh(smallPlanetGeometry, smallPlanetMaterial1);
    smallPlanet1.position.set(2, -2, 4);
    smallPlanet1.userData.orbit = {
        radius: 4.5
    };
    planets.push(smallPlanet1);
    
    const smallPlanetMaterial2 = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const smallPlanet2 = new THREE.Mesh(smallPlanetGeometry, smallPlanetMaterial2);
    smallPlanet2.position.set(-3, -1, -3);
    smallPlanet2.userData.orbit = {
        radius: 3.5
    };
    planets.push(smallPlanet2);
    
    return planets;
}