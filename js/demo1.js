createLandscape({
  palleteImage:'img/pallete5.png'
})

function createLandscape(params){

  var container = document.querySelector(".landscape")
  var width = window.innerWidth;
  var height = window.innerHeight;

  var scene, renderer, camera;
  var terrain;

  var mouse = { x:0, y:0, xDamped:0, yDamped:0 };
  var isMobile = typeof window.orientation !== 'undefined'

  init();

  function init(){

    sceneSetup();
    sceneElements();
    sceneTextures();
    render();

    if(isMobile)
      window.addEventListener("touchmove", onInputMove, {passive:false})
    else
      window.addEventListener("mousemove", onInputMove)
    
    window.addEventListener("resize", resize)
    resize()
  }

  function sceneSetup(){
    scene = new THREE.Scene();
    var fogColor = new THREE.Color( 0xffffff )
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, 10, 400);

    
    sky()

    camera = new THREE.PerspectiveCamera(60, width / height, .1, 10000);
    camera.position.y = 8;
    camera.position.z = 4;
    
    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight)
    

    renderer = new THREE.WebGLRenderer( {
      canvas:container,
      antialias:true
    } );
    renderer.setPixelRatio = devicePixelRatio;
    renderer.setSize(width, height);
    

  }

  function sceneElements(){

    var geometry = new THREE.PlaneBufferGeometry(100, 400, 400, 400);

    var uniforms = {
      time: { type: "f", value: 0.0 },
      distortCenter: { type: "f", value: 0.1 },
      roadWidth: { type: "f", value: 0.5 },
      pallete:{ type: "t", value: null},
      speed: { type: "f", value: 0.5 },
      maxHeight: { type: "f", value: 10.0 },
      color:new THREE.Color(1, 1, 1)
    }
    
    var material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([ THREE.ShaderLib.basic.uniforms, uniforms ]),
      vertexShader: document.getElementById( 'custom-vertex' ).textContent,
      fragmentShader: document.getElementById( 'custom-fragment' ).textContent,
      wireframe:false,
      fog:true
    });

    terrain = new THREE.Mesh(geometry, material);
    terrain.position.z = -180;
    terrain.rotation.x = -Math.PI / 2

    scene.add(terrain)

  }

  function sceneTextures(){
    // pallete
    new THREE.TextureLoader().load( params.palleteImage, function(texture){
      terrain.material.uniforms.pallete.value = texture;
      terrain.material.needsUpdate = true;
    });
  }

  function sky(){
    sky = new THREE.Sky();
    sky.scale.setScalar( 450000 );
    sky.material.uniforms.turbidity.value = 20;
    sky.material.uniforms.rayleigh.value = 0;
    sky.material.uniforms.luminance.value = 1;
    sky.material.uniforms.mieCoefficient.value = 0.01;
    sky.material.uniforms.mieDirectionalG.value = 0.8;
    
    scene.add( sky );

    sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry( 20000, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.visible = false;
    scene.add( sunSphere );
    
    var theta = Math.PI * ( -0.02 );
    var phi = 2 * Math.PI * ( -.25 );

    sunSphere.position.x = 400000 * Math.cos( phi );
    sunSphere.position.y = 400000 * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = 400000 * Math.sin( phi ) * Math.cos( theta );
    
    sky.material.uniforms.sunPosition.value.copy( sunSphere.position );
  }

  function resize(){
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
  }

  function onInputMove(e){
    e.preventDefault();
    
    var x, y
    if(e.type == "mousemove"){
      x = e.clientX;
      y = e.clientY;
    }else{
      x = e.changedTouches[0].clientX
      y = e.changedTouches[0].clientY
    }
    
    mouse.x = x;
    mouse.y = y;
    
  }

  function render(){
    requestAnimationFrame(render)

    // damping mouse for smoother interaction
    mouse.xDamped = lerp(mouse.xDamped, mouse.x, 0.1);
    mouse.yDamped = lerp(mouse.yDamped, mouse.y, 0.1);

    var time = performance.now() * 0.001
    terrain.material.uniforms.time.value = time;
    terrain.material.uniforms.distortCenter.value = map(mouse.xDamped, 0, width, -0.1, 0.1);
    terrain.material.uniforms.roadWidth.value = map(mouse.yDamped, 0, height, -0.5, 2.5);


    renderer.render(scene, camera)

  }

  function map (value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
  }

  function lerp (start, end, amt){
    return (1 - amt) * start + amt * end
  }
}

const getRandomNumber = (min, max) => (Math.random() * (max - min) + min);

animateTitles();

function animateTitles() {
  const overlay = document.querySelector('.overlay'); 
  const title = document.querySelector('.content__title');
  charming(title);
  const titleLetters = Array.from(title.querySelectorAll('span'));

  TweenMax.to(overlay, 2, {
    ease: Quad.easeOut,
    opacity: 0
  });

  TweenMax.set(titleLetters, {opacity: 0});
  TweenMax.staggerTo(titleLetters, 1.5, {
    ease: Expo.easeOut,
    startAt: {rotationX: -100, z: -1000},
    opacity: 1,
    rotationX: 0,
    z: 0
  }, 0.1);

  const subtitle = document.querySelector('.content__subtitle');
  TweenMax.set(subtitle, {opacity: 0});
  TweenMax.to(subtitle, 1.5, {
    ease: Expo.easeOut,
    startAt: {y: 30},
    opacity: 1,
    y: 0
  });

  const glitch = (el,cycles) => {
    if ( cycles === 0 || cycles > 3 ) return;
    TweenMax.set(el, {
      x: getRandomNumber(-20,20), 
      y: getRandomNumber(-20,20),
      color: ['#95dc77','#f3eb8a','#f9b97f'][cycles-1]
    });
    setTimeout(() => {
      TweenMax.set(el, {x: 0, y: 0, color: '#fff'});
      glitch(el, cycles-1);
    }, getRandomNumber(20,100));
  };

  const loop = (startAt) => {
    this.timeout = setTimeout(() => {
        const titleLettersShuffled = titleLetters.sort((a,b) => 0.5 - Math.random());
        const lettersSet = titleLettersShuffled.slice(0, getRandomNumber(1,titleLetters.length+1));
        for (let i = 0, len = lettersSet.length; i < len-1; ++i) {
          glitch(lettersSet[i], 3);
        }
        loop();
    }, startAt || getRandomNumber(500, 3000));
  }
  loop(1500);
}