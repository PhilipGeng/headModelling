		var gl = null,
			canvas = null,
			glProgram = null,
			fragmentShader = null,
			vertexShader = null;
			yaxis = new Array(0,1,0);
			xaxis = new Array(1,0,0);
			rotAxis = yaxis;
			rotate_head = 0; //0-not rotate 1-rotate;
			rotate_orientation = 1; //1 - right/up -1 - left/down
			
		var vertexPositionAttribute = null,
			vertexNormalAttribute = null,
			trianglesVerticeBuffer = null,
			vertexColorAttribute = null,
			trianglesColorBuffer = null;
			document.onkeydown = handleKeyDown;

		var mvMatrix = mat4.create(),
			pMatrix = mat4.create();
		var rotateValue = 0.0;

		var meshStr = readTextFile("meshes/head.obj");
		var meshObj = new OBJ.Mesh(meshStr);

		var timeStep = 0.0;

		function handleKeyDown(event){
			switch(event.keyCode){
				case 65://a
					rotate_head = 0;
				break;
				case 83://s	
					rotate_head = 1;
				break;
				case 27://esc
					rotateValue = 0;
				break;
				case 38://up
					rotAxis = xaxis;
					rotate_orientation = 1;
				break;
				case 40://down
					rotAxis = xaxis;
					rotate_orientation = -1;
				break;
				case 37://left
					rotAxis = yaxis;
					rotate_orientation = -1;
				break;
				case 39://right
					rotAxis = yaxis;
					rotate_orientation = 1;
				break;
				default:
					return;
			}
		}
		
		function initWebGL()
		{
			canvas = document.getElementById("my-canvas");
			gl = canvas.getContext("experimental-webgl");

			if(gl)
			{
				initBuffers();
				initShaders();
				initMatrixUniforms();
				animLoop();
			}else{
				alert( "Error: Your browser does not appear to" + "support WebGL.");
			}
		}

		function animLoop()
		{
			timeStep += 0.04;
			updateWebGL();
			updateBuffers();
			updateMatrixUniforms();
			updateOtherUniforms();
			drawScene();
			requestAnimationFrame(animLoop, canvas);
		}

		function updateWebGL()
		{
			gl.enable(gl.DEPTH_TEST);

			//set the clear color to a shade of green
			gl.clearColor(0.1, 0.1, 0.1, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			//set viewport
			gl.viewport(0, 0, canvas.width, canvas.height);

			//set view and projection matrix
			mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
			mat4.identity(mvMatrix);
			mat4.translate(mvMatrix, [0, 0, -8.0]);
			if(rotate_head ==1){
				rotateValue += rotate_orientation*0.02;
			}
			mat4.rotate(mvMatrix, rotateValue, rotAxis, null);
			
		}

		function initShaders()
		{
			//get shader source
			var fs_source = document.getElementById('shader-fs').innerHTML,
			vs_source = document.getElementById('shader-vs').innerHTML;

			//compile shaders
			vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
			fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);

			//create program
			glProgram = gl.createProgram();

			//attach and link shaders to the program
			gl.attachShader(glProgram, vertexShader);
			gl.attachShader(glProgram, fragmentShader);
			gl.linkProgram(glProgram);
			if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
				alert("Unable to initialize the shader program.");
			}

			//use program
			gl.useProgram(glProgram);
		}

		function makeShader(src, type)
		{
			//compile the vertex shader
			var shader = gl.createShader(type);
			gl.shaderSource(shader, src);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
			}
			return shader;
		}

		function initBuffers()
		{
			OBJ.initMeshBuffers( gl, meshObj );
		}

		function updateBuffers()
		{

		}

		function drawScene()
		{
			vertexPositionAttribute = gl.getAttribLocation(glProgram,
				"aVertexPosition");
			gl.enableVertexAttribArray(vertexPositionAttribute);
			gl.bindBuffer(gl.ARRAY_BUFFER, meshObj.vertexBuffer);
			gl.vertexAttribPointer(vertexPositionAttribute, 3,
				gl.FLOAT, false, 0, 0);

			vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
			gl.enableVertexAttribArray(vertexNormalAttribute);
			gl.bindBuffer(gl.ARRAY_BUFFER, meshObj.normalBuffer);
			gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshObj.indexBuffer);
			gl.drawElements(gl.TRIANGLES, meshObj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}

		function initMatrixUniforms(){
			glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
			glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");
		}

		function updateMatrixUniforms() {
			gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
			gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
		}

		function updateOtherUniforms() {
			glProgram.fTimeStep = gl.getUniformLocation(glProgram, "fTimeStep");
			gl.uniform1f(glProgram.fTimeStep, timeStep);
		}

		function readTextFile(file)
		{
		    var rawFile = new XMLHttpRequest();
		    var strText;
		    rawFile.open("GET", file, false);
		    rawFile.onreadystatechange = function ()
		    {
		        if(rawFile.readyState === 4)
		        {
		            if(rawFile.status === 200 || rawFile.status == 0)
		            {
		                strText = rawFile.responseText;
		            }
		        }
		    }
		    rawFile.send(null);
		    return strText;
		}
