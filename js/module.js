let app = new Vue({
	el: "#app",
	data: {
		over: false, // 本局棋是否结束
		me: true, // 当前是否是我方执子
		bNowi: 0, // x of me
		bNowj: 0, // y of me
		bCompi: 0, // x of computer
		bCompj: 0, // y of computer
		bMyWin: [], // 记录上一步我在各种赢法上的已完成子数
		bCompWin: [], // 记录上一步computer在各种赢法上的已完成子数
		backAble: false, //	是否允许我方悔棋
		returnAble: false, // 是否允许我方撤销悔棋
		chessBoard: [], // 记录棋盘落子情况
		myWin: [], //记录当前我在各种赢法上的已完成子数
		computerWin: [], // 记录当前computer在各种赢法上的已完成子数
		wins: [], // 记录所有赢法及关联的棋子位置
		count: 0, // 记录赢法总数
		pageContent: 'GOBANG', // 页面上方标题（提示语）文本	
	},
	mounted() {
		this.initGame();
		this.countWins();
		this.initRecords();
		this.drawChessBoard();
	},
	methods: {
		initGame() {
			// 初始化棋盘
			for(var i = 0; i < 15; i++){
			    this.chessBoard[i] = [];
			    for(var j = 0; j < 15; j++){
			        this.chessBoard[i][j] = 0;
			    }
			}
		},
		countWins() {
			// 统计赢法
			//  // 初始化赢法统计数组
			for(var i = 0; i < 15; i++){
			    this.wins[i] = [];
			    for(var j = 0; j < 15; j++){
			        this.wins[i][j] = [];
			    }
			};
			// 统计横线赢法并关联对应棋子坐标
			for(var i = 0; i < 15; i++){
			    for(var j = 0; j < 11; j++){
			        for(var k = 0; k < 5; k++){
			            this.wins[i][j+k][this.count] = true;
			        }
			        this.count++;
			    }
			};
			// 统计竖线赢法并关联对应棋子坐标
			for(var i = 0; i < 15; i++){
			    for(var j = 0; j < 11; j++){
			        for(var k = 0; k < 5; k++){
			            this.wins[j+k][i][this.count] = true;
			        }
			        this.count++;
			    }
			};
			// 统计正斜线赢法并关联对应棋子坐标
			for(var i = 0; i < 11; i++){
			    for(var j = 0; j < 11; j++){
			        for(var k = 0; k < 5; k++){
			            this.wins[i+k][j+k][this.count] = true;
			        }
			        this.count++;
			    }
			};
			// 统计反斜线赢法并关联对应棋子坐标
			for(var i = 0; i < 11; i++){ 
			    for(var j = 14; j > 3; j--){
			        for(var k = 0; k < 5; k++){
			            this.wins[i+k][j-k][this.count] = true;
			        }
			        this.count++;
			    }
			}
		},
		initRecords() {
			// 初始化双方各赢法情况统计数组
			for(var i = 0; i < this.count; i++){
			    this.myWin[i] = 0;
			    this.bMyWin[i] = 0;
			    this.computerWin[i] = 0;
			    this.bCompWin[i] = 0;
			}
		},
		restart() {
			window.location.reload();
		},
		chessClick: function(e) {
			if(this.over || !this.me) {
				return;
			};
			// 悔棋功能可用
			this.$refs.goback.className = this.$refs.goback.className.replace( new RegExp( "(\\s|^)unable(\\s|$)" )," " ); 
			var x = e.offsetX;
			var y = e.offsetY;
			var i = Math.floor(x / 30);
			var j = Math.floor(y / 30);
			this.bNowi = i;
			this.bNowj = j;
			if(this.chessBoard[i][j] == 0){
				this.oneStep(i,j,this.me);
				this.chessBoard[i][j] = 1; //我，已占位置
				for(var k = 0; k < this.count; k++){ // 将可能赢的情况都加1
					if(this.wins[i][j][k]){
						// debugger;
						this.myWin[k]++;
						this.bCompWin[k] = this.computerWin[k];
						this.computerWin[k] = 6;//这个位置对方不可能赢了
						if(this.myWin[k] == 5){
							// window.alert('你赢了');
							this.pageContent = '恭喜，你赢了！';
							this.over = true;
						}
					}
				}
				if(!this.over){
					this.me = !this.me;
					this.computerAI();
				}
			}
		},
		goBack: function(e) {
			if(!this.backAble) { return;}
			this.over = false;
			this.me = true;
			// this.pageContent = 'o(╯□╰)o，悔棋中';
			// 撤销悔棋功能可用
			this.$refs.undo.className = this.$refs.undo.className.replace( new RegExp( "(\\s|^)unable(\\s|$)" )," " ); 
			// 我，悔棋
			this.chessBoard[this.bNowi][this.bNowj] = 0; //我，已占位置 还原
			this.minusStep(this.bNowi, this.bNowj); //销毁棋子                                  
			for(var k = 0; k < this.count; k++){ // 将可能赢的情况都减1
			    if(this.wins[this.bNowi][this.bNowj][k]){
			        this.myWin[k]--;
			        this.bMyWin[k]--;
			        this.computerWin[k] = this.bCompWin[k];//这个位置对方可能赢
			    }
			}
			
			// 计算机相应的悔棋
			this.chessBoard[this.bCompi][this.bCompj] = 0; //计算机，已占位置 还原
			this.minusStep(this.bCompi, this.bCompj); //销毁棋子                                  
			for(var k = 0; k < this.count; k++){ // 将可能赢的情况都减1
			    if(this.wins[this.bCompi][this.bCompj][k]){
			        this.computerWin[k]--;
			        this.bCompWin[k]--;
			        this.myWin[k] = this.bMyWin[k];//这个位置对方可能赢
			    }
			}
			this.pageContent = 'GOBANG';
			this.returnAble = true;
			this.backAble = false;
		},
		returncli: function(e) {
			if(!this.returnAble) { return; }
			    // 我，撤销悔棋
			this.chessBoard[this.bNowi][this.bNowj] = 1; //我，已占位置 
			this.oneStep(this.bNowi,this.bNowj,this.me);                              
			for(var k = 0; k < this.count; k++){ 
			    if(this.wins[this.bNowi][this.bNowj][k]){
			        this.myWin[k]++;
			        this.bCompWin[k] = this.computerWin[k];
			        this.computerWin[k] = 6;//这个位置对方不可能赢
			    }
			    if(this.myWin[k] == 5){
			        this.pageContent = '恭喜，你赢了！';
			        this.over = true;
			    }
			}
			
			// 计算机撤销相应的悔棋
			this.chessBoard[this.bCompi][this.bCompj] = 2; //计算机，已占位置   
			this.oneStep(this.bCompi,this.bCompj,false);                               
			for(var k = 0; k < this.count; k++){ // 将可能赢的情况都减1
			    if(this.wins[this.bCompi][this.bCompj][k]){
			        this.computerWin[k]++;
			        this.bMyWin[k] = this.myWin[k];
			        this.myWin[k] = 6;//这个位置对方不可能赢
			    }
			    if(this.computerWin[k] == 5){
			        this.pageContent = 'o(╯□╰)o，计算机赢了，继续加油哦！';
			        this.over = true;
			    }
			}
			this.$refs.undo.className += ' '+ 'unable';
			this.returnAble = false;
			this.backAble = true;
		},
		computerAI: function() {
			var myScore = [];
			var computerScore = [];
			var max = 0;
			var u = 0, v = 0;
			for(var i = 0; i < 15; i++){
			    myScore[i] = [];
			    computerScore[i] = [];
			    for(var j = 0; j < 15; j++){
			        myScore[i][j] = 0;
			        computerScore[i][j] = 0;
			    }
			}
			for(var i = 0; i < 15; i++){
			    for(var j = 0; j < 15; j++){
			        if(this.chessBoard[i][j] == 0){
			            for(var k = 0; k < this.count; k++){
			                if(this.wins[i][j][k]){
			                    if(this.myWin[k] == 1){
			                        myScore[i][j] += 200;
			                    }else if(this.myWin[k] == 2){
			                        myScore[i][j] += 400;
			                    }else if(this.myWin[k] == 3){
			                        myScore[i][j] += 2000;
			                    }else if(this.myWin[k] == 4){
			                        myScore[i][j] += 10000;
			                    }
			                    
			                    if(this.computerWin[k] == 1){
			                        computerScore[i][j] += 220;
			                    }else if(this.computerWin[k] == 2){
			                        computerScore[i][j] += 420;
			                    }else if(this.computerWin[k] == 3){
			                        computerScore[i][j] += 2100;
			                    }else if(this.computerWin[k] == 4){
			                        computerScore[i][j] += 20000;
			                    }                        
			                }
			            }
			            
			            if(myScore[i][j] > max){
			                max  = myScore[i][j];
			                u = i;
			                v = j;
			            }else if(myScore[i][j] == max){
			                if(computerScore[i][j] > computerScore[u][v]){
			                    u = i;
			                    v = j;    
			                }
			            }
			            
			            if(computerScore[i][j] > max){
			                max  = computerScore[i][j];
			                u = i;
			                v = j;
			            }else if(computerScore[i][j] == max){
			                if(myScore[i][j] > myScore[u][v]){
			                    u = i;
			                    v = j;    
			                }
			            }
			            
			        }
			    }
			}
			this.bCompi = u;
			this.bCompj = v;
			this.oneStep(u,v,false);
			this.chessBoard[u][v] = 2;  //计算机占据位置
			for(var k = 0; k < this.count; k++){
			    if(this.wins[u][v][k]){
			        this.computerWin[k]++;
			        this.bMyWin[k] = this.myWin[k];
			        this.myWin[k] = 6;//这个位置对方不可能赢了
			        if(this.computerWin[k] == 5){
			            this.pageContent = 'o(╯□╰)o，计算机赢了，继续加油哦！';
			            this.over = true;
			        }
			    }
			}
			if(!this.over){
			    this.me = !this.me;
			}
			this.backAble = true;
			this.returnAble = false;
			var hasClass = new RegExp('unable').test(' ' + this.$refs.undo.className + ' ');
			if(!hasClass) {
			    this.$refs.undo.className += ' ' + 'unable';
			}
		},
		drawChessBoard: function() {
			let chess = this.$refs.chessBoard;
			let context = chess.getContext('2d');
			context.strokeStyle = '#bfbfbf'; //边框颜色
			for(var i = 0; i < 15; i++){
			    context.moveTo(15 + i * 30 , 15);
			    context.lineTo(15 + i * 30 , 435);
			    context.stroke();
			    context.moveTo(15 , 15 + i * 30);
			    context.lineTo(435 , 15 + i * 30);
			    context.stroke();
			}
		},
		oneStep: function(i, j, myTurn) {
			let chess = this.$refs.chessBoard;
			let context = chess.getContext('2d');
			context.strokeStyle = '#bfbfbf'; //边框颜色
			context.beginPath();
			context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);// 画圆
			context.closePath();
			//渐变
			var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
			
			if(myTurn){
			    gradient.addColorStop(0,'#0a0a0a');
			    gradient.addColorStop(1,'#636766');
			}else{
			    gradient.addColorStop(0,'#d1d1d1');
			    gradient.addColorStop(1,'#f9f9f9');
			}
			context.fillStyle = gradient;
			context.fill();
		},
		minusStep: function(i, j) {
			let chess = this.$refs.chessBoard;
			let context = chess.getContext('2d');
			context.strokeStyle = '#bfbfbf'; //边框颜色
			//擦除该圆
			context.clearRect((i) * 30, (j) * 30, 30, 30);
			
			// 重画该圆周围的格子
			context.beginPath();
			context.moveTo(15+i*30 , j*30);
			context.lineTo(15+i*30 , j*30 + 30);
			context.moveTo(i*30, j*30+15);
			context.lineTo((i+1)*30 , j*30+15);
			
			context.stroke();
		}
	}
})
