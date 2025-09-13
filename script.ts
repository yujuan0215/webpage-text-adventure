// 文字冒險遊戲主邏輯
interface GameState {
    currentScene: string;
    visitedScenes: Set<string>;
    inventory: string[];
    collectedItems: Set<string>;
    unlockedSecrets: Set<string>;
    sceneHistory: string[];
}

interface Scene {
    id: string;
    title: string;
    description: string;
    choices: Choice[];
    onEnter?: () => void;
}

interface Choice {
    text: string;
    action: () => void;
    condition?: () => boolean;
    reward?: string; // 收集到的物品
}

class TextAdventure {
    private gameState: GameState;
    private scenes: Map<string, Scene>;
    private storyDisplay: HTMLElement;
    private choicesContainer: HTMLElement;
    private userInput: HTMLInputElement;
    private backBtn: HTMLButtonElement;
    private homeBtn: HTMLButtonElement;

    constructor() {
        this.gameState = {
            currentScene: 'start',
            visitedScenes: new Set(),
            inventory: [],
            collectedItems: new Set(),
            unlockedSecrets: new Set(),
            sceneHistory: []
        };

        this.storyDisplay = document.getElementById('story-display')!;
        this.choicesContainer = document.getElementById('choices-container')!;
        this.userInput = document.getElementById('user-input') as HTMLInputElement;
        this.backBtn = document.getElementById('back-btn') as HTMLButtonElement;
        this.homeBtn = document.getElementById('home-btn') as HTMLButtonElement;

        this.scenes = new Map();
        this.initializeScenes();
        this.setupEventListeners();
        this.startGame();
    }

    private initializeScenes(): void {
        // 開始場景
        this.scenes.set('start', {
            id: 'start',
            title: '歡迎來到林妤娟的個人網頁',
            description: `這是一個文字冒險式的個人網頁，你可以點選各個選項來進一步的了解我
            
            右上有返回鍵可以回到上一頁，主頁鍵可以回到首頁
            
            如果有任何問題可以在選項輸入help，在興趣區塊可以得到一些物品，能夠進一步了解我的興趣。`,
            choices: [
                {
                    text: '查看我的基本資料',
                    action: () => this.goToScene('intro')
                },
                {
                    text: '探索我的學術歷程',
                    action: () => this.goToScene('academic')
                },
                {
                    text: '了解我的專案經歷',
                    action: () => this.goToScene('projects')
                },
                {
                    text: '發現我的興趣愛好',
                    action: () => this.goToScene('interests')
                },
                {
                    text: '🔓 隱藏區域 (需要收集 3 個物品)',
                    action: () => this.goToScene('hidden_scene'),
                    condition: () => this.gameState.unlockedSecrets.has('hidden_scene')
                },
                {
                    text: '🌟 終極秘密 (需要收集 6 個物品)',
                    action: () => this.goToScene('ultimate_scene'),
                    condition: () => this.gameState.unlockedSecrets.has('ultimate_scene')
                }
            ]
        });

        // 自我介紹場景
        this.scenes.set('intro', {
            id: 'intro',
            title: '關於我',
            description: `你好！我是林妤娟，一個喜歡程式的學生。

我目前就讀於台灣大學資訊管理學系，高中就讀北一女中

喜歡嘗試探索各個領域，你可以透過以下的選項了解我：`,
            choices: [
                {
                    text: '了解我的學術背景',
                    action: () => this.goToScene('academic')
                },
                {
                    text: '查看我的專案作品',
                    action: () => this.goToScene('projects')
                },
                {
                    text: '探索我的興趣',
                    action: () => this.goToScene('interests')
                }
            ]
        });

        // 學術歷程場景
        this.scenes.set('academic', {
            id: 'academic',
            title: '學術歷程',
            description: `讓我來分享我的學術歷程：

🎓 學歷背景：
• 北一女中畢業
• 台灣大學資訊管理學系（就讀中）

📚 修課資訊：`,
            choices: [
                {
                    text: '查看 113-1 學期課程',
                    action: () => this.goToScene('courses_113_1')
                },
                {
                    text: '查看 113-2 學期課程',
                    action: () => this.goToScene('courses_113_2')
                },
                {
                    text: '查看 114-1 學期課程',
                    action: () => this.goToScene('courses_114_1')
                }
            ]
        });

        // 113-1 課程
        this.scenes.set('courses_113_1', {
            id: 'courses_113_1',
            title: '113-1 學期課程',
            description: `113-1 學期修習課程：

這些課程為我奠定了扎實的基礎：`,
            choices: [
                {
                    text: '查看其他學期',
                    action: () => this.goToScene('academic')
                },
                {
                    text: '了解我的專案',
                    action: () => this.goToScene('projects')
                }
            ],
            onEnter: () => this.displayCourses('113-1')
        });

        // 113-2 課程
        this.scenes.set('courses_113_2', {
            id: 'courses_113_2',
            title: '113-2 學期課程',
            description: `113-2 學期修習課程：

這個學期我深入學習了更多專業知識：`,
            choices: [
                {
                    text: '查看其他學期',
                    action: () => this.goToScene('academic')
                },
                {
                    text: '了解我的專案',
                    action: () => this.goToScene('projects')
                },
            ],
            onEnter: () => this.displayCourses('113-2')
        });

        // 114-1 課程
        this.scenes.set('courses_114_1', {
            id: 'courses_114_1',
            title: '114-1 學期課程',
            description: `114-1 學期修習課程：

最新的學期，我選擇了這些課程：`,
            choices: [
                {
                    text: '查看其他學期',
                    action: () => this.goToScene('academic')
                },
                {
                    text: '了解我的專案',
                    action: () => this.goToScene('projects')
                },
            ],
            onEnter: () => this.displayCourses('114-1')
        });

        // 專案經歷場景
        this.scenes.set('projects', {
            id: 'projects',
            title: '專案經歷',
            description: `我的專案經歷：

這些專案展現了我的技術能力和創意思維：`,
            choices: [
                {
                    text: '查看 GitHub 專案',
                    action: () => this.goToScene('github_project')
                },
                {
                    text: '了解口罩人臉辨識專題',
                    action: () => this.goToScene('mask_recognition')
                },
            ]
        });

        // GitHub 專案
        this.scenes.set('github_project', {
            id: 'github_project',
            title: 'GitHub 專案',
            description: `🔗 GitHub 專案：IM-Academic-Warrior

這是我在 GitHub 上的一個重要專案，展現了我的程式設計能力。

專案特色：
• 完整的程式架構設計
• 清晰的程式碼註解
• 實用的功能實現
• 良好的版本控制

你可以在這裡查看：https://github.com/IM-Little-Circle/IM-ACademic-WArrior`,
            choices: [
                {
                    text: '了解口罩人臉辨識專題',
                    action: () => this.goToScene('mask_recognition')
                },
,
            ]
        });

        // 口罩人臉辨識專題
        this.scenes.set('mask_recognition', {
            id: 'mask_recognition',
            title: '口罩人臉辨識專題',
            description: `🎭 專題研究：口罩人臉辨識系統

這是一個結合人工智慧和影像處理的專題研究：

技術特點：
• 使用深度學習模型進行人臉辨識
• 能夠識別戴口罩的人臉
• 實時影像處理能力
• 高準確率的辨識結果

這個專題讓我深入了解了：
• 機器學習和深度學習
• 電腦視覺技術
• 影像處理演算法
• 模型訓練和優化`,
            choices: [
                {
                    text: '查看 GitHub 專案',
                    action: () => this.goToScene('github_project')
                },
,
            ]
        });

        // 興趣愛好場景
        this.scenes.set('interests', {
            id: 'interests',
            title: '我的興趣',
            description: `🎵 我的興趣愛好：

音樂是我生活中不可或缺的一部分，它為我的程式設計工作帶來了靈感：`,
            choices: [
                {
                    text: '了解我的音樂喜好',
                    action: () => this.goToScene('music_taste')
                },
                {
                    text: '探索其他興趣',
                    action: () => this.goToScene('other_interests')
                },
            ]
        });

        // 音樂喜好
        this.scenes.set('music_taste', {
            id: 'music_taste',
            title: '音樂世界',
            description: `🎶 我的音樂世界：

我熱愛各種類型的音樂，特別是：

🎧 電子音樂
• 喜歡電子音樂的節奏感和未來感
• 在程式設計時經常聽電子音樂來保持專注

🇯🇵 JPOP - Yorushika
• 特別喜歡 Yorushika 的音樂
• 他們的歌詞和旋律總能觸動我的心靈
• 在學習和思考時的最佳伴侶

🇫🇷 French Musical
• 法式音樂劇的優雅和浪漫
• 喜歡其獨特的藝術表現形式
• 為我的創意工作帶來靈感

音樂不僅是我的娛樂，更是我創作的靈感來源。`,
            choices: [
                {
                    text: '聆聽電子音樂',
                    action: () => {
                        this.collectItem('電子節拍');
                    },
                    reward: '電子節拍'
                },
                {
                    text: '欣賞 Yorushika 的音樂',
                    action: () => {
                        this.collectItem('心靈旋律');
                    },
                    reward: '心靈旋律'
                },
                {
                    text: '體驗法式音樂劇',
                    action: () => {
                        this.collectItem('浪漫音符');
                    },
                    reward: '浪漫音符'
                },
                {
                    text: '了解其他興趣',
                    action: () => this.goToScene('other_interests')
                }
            ]
        });

        // 其他興趣
        this.scenes.set('other_interests', {
            id: 'other_interests',
            title: '其他興趣',
            description: `除了音樂，我還有其他豐富的興趣：

💻 程式設計
• 享受解決問題的過程
• 喜歡學習新技術
• 熱衷於創造有用的應用程式

📚 學習新知識
• 持續學習新的程式語言和框架
• 關注科技趨勢和發展
• 喜歡挑戰自己的認知邊界

🎮 遊戲設計
• 對遊戲開發有濃厚興趣
• 喜歡思考遊戲機制和用戶體驗
• 希望未來能創造有趣的互動體驗`,
            choices: [
                {
                    text: '學習程式設計',
                    action: () => {
                        this.collectItem('程式碼片段');
                    },
                    reward: '程式碼片段'
                },
                {
                    text: '探索新知識',
                    action: () => {
                        this.collectItem('智慧結晶');
                    },
                    reward: '智慧結晶'
                },
                {
                    text: '設計遊戲機制',
                    action: () => {
                        this.collectItem('創意火花');
                    },
                    reward: '創意火花'
                },
                {
                    text: '了解我的音樂喜好',
                    action: () => this.goToScene('music_taste')
                }
            ]
        });

        // 隱藏場景
        this.scenes.set('hidden_scene', {
            id: 'hidden_scene',
            title: '🔓 隱藏區域',
            description: `🎉 恭喜你找到了隱藏區域！

這裡是我的一些不為人知的小秘密：

🎨 創意靈感
• 我喜歡在深夜時分思考程式設計問題
• 有時候會因為想到一個好的演算法而興奮得睡不著
• 最喜歡的程式語言是 TypeScript，因為它的類型安全

🌙 生活習慣
• 我是夜貓子，最有效率的時間是晚上 10 點到凌晨 2 點
• 喜歡在咖啡廳寫程式，背景音樂是必須的
• 收集了很多可愛的程式設計相關貼紙

💭 未來夢想
• 希望能夠開發出改變世界的應用程式
• 想要學習更多關於人工智慧和機器學習的知識
• 夢想有一天能夠在科技公司工作`,
            choices: [
                {
                    text: '獲得隱藏獎勵：靈感之光',
                    action: () => {
                        this.collectItem('靈感之光');
                    },
                    reward: '靈感之光'
                },
            ]
        });

        // 終極秘密場景
        this.scenes.set('ultimate_scene', {
            id: 'ultimate_scene',
            title: '🌟 終極秘密',
            description: `🎊 歡迎來到終極秘密區域！

你已經收集了所有物品，現在可以了解我最深層的秘密：

💝 真正的我
• 雖然我熱愛程式設計，但我其實是個很感性的人
• 我認為程式設計不只是技術，更是一種藝術創作
• 每次完成一個專案，我都會感到無比的成就感

🎯 人生哲學
• 我相信每個問題都有解決方案，只是需要時間和耐心
• 我喜歡幫助別人解決程式設計問題
• 認為分享知識是程式設計師最重要的品質之一

🚀 終極目標
• 我想要創造出能夠真正幫助人們的軟體
• 希望能夠成為一個優秀的軟體工程師
• 夢想有一天能夠開設自己的科技公司

感謝你花時間了解我！這個文字冒險遊戲本身就是我創意的一個體現。`,
            choices: [
                {
                    text: '獲得終極獎勵：夢想之翼',
                    action: () => {
                        this.collectItem('夢想之翼');
                    },
                    reward: '夢想之翼'
                },
                {
                    text: '重新開始冒險',
                    action: () => {
                        this.gameState = {
                            currentScene: 'start',
                            visitedScenes: new Set(),
                            inventory: [],
                            collectedItems: new Set(),
                            unlockedSecrets: new Set(),
                            sceneHistory: []
                        };
                        this.goToScene('start');
                    }
                },
            ]
        });
    }

    private displayCourses(semester: string): void {
        const courses = this.getCoursesBySemester(semester);
        const courseList = courses.map(course => 
            `<div class="course-item">${course}</div>`
        ).join('');
        
        this.storyDisplay.innerHTML += `
            <div class="section-title">${semester} 學期課程：</div>
            ${courseList}
        `;
    }

    private getCoursesBySemester(semester: string): string[] {
        // 這裡可以根據實際課程填入
        const courseData: { [key: string]: string[] } = {
            '113-1': [
                '程式設計',
                '資料結構',
                '微積分',
                '線性代數',
                '英文',
                '通識課程'
            ],
            '113-2': [
                '演算法',
                '資料庫系統',
                '作業系統',
                '機率統計',
                '英文',
                '通識課程'
            ],
            '114-1': [
                '軟體工程',
                '網路程式設計',
                '人工智慧',
                '資訊安全',
                '英文',
                '通識課程'
            ]
        };
        
        return courseData[semester] || [];
    }

    private setupEventListeners(): void {
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

        // 點擊選擇項
        this.choicesContainer.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('choice')) {
                target.click();
            }
        });

        // 導航按鈕事件
        this.backBtn.addEventListener('click', () => {
            this.goBack();
        });

        this.homeBtn.addEventListener('click', () => {
            this.goToScene('start');
        });
    }

    private handleUserInput(): void {
        const input = this.userInput.value.trim();
        this.userInput.value = '';

        // 處理數字輸入
        const number = parseInt(input);
        if (!isNaN(number) && number >= 1 && number <= 9) {
            this.handleNumberKey(number);
            return;
        }

        const inputLower = input.toLowerCase();

        // 處理特殊指令
        if (inputLower === 'help' || inputLower === '幫助') {
            this.showHelp();
        } else if (inputLower === 'inventory' || inputLower === '物品') {
            this.showInventory();
        } else if (inputLower === 'back' || inputLower === '返回') {
            this.goToScene('start');
        } else {
            this.addStoryLine(`> ${input}`, 'user-input');
            this.addStoryLine('未知指令。請使用選單選項或輸入 "help" 查看幫助。');
        }
    }

    private handleNumberKey(number: number): void {
        const currentScene = this.scenes.get(this.gameState.currentScene);
        if (!currentScene) return;

        const visibleChoices = currentScene.choices.filter(choice => 
            !choice.condition || choice.condition()
        );

        if (number >= 1 && number <= visibleChoices.length) {
            const selectedChoice = visibleChoices[number - 1];
            this.addStoryLine(`> ${number}`, 'user-input');
            
            // 添加視覺反饋
            const choiceElements = this.choicesContainer.querySelectorAll('.choice');
            if (choiceElements[number - 1]) {
                choiceElements[number - 1].classList.add('highlight');
                setTimeout(() => {
                    choiceElements[number - 1].classList.remove('highlight');
                }, 200);
            }
            
            selectedChoice.action();
        }
    }

    private showHelp(): void {
        this.addStoryLine(`
可用指令：
• help - 顯示此幫助訊息
• inventory - 查看物品欄
• back - 返回主選單
• 直接點擊選單選項進行選擇
• 輸入數字 1-9 然後按 Enter 快速選擇對應選項
• 使用右上角的導航按鈕進行快速導航
        `);
    }

    private showInventory(): void {
        if (this.gameState.collectedItems.size === 0) {
            this.addStoryLine('你的物品欄是空的。');
        } else {
            const items = Array.from(this.gameState.collectedItems);
            this.addStoryLine(`物品欄：${items.join(', ')}`);
            this.addStoryLine(`已收集 ${items.length} 個物品`);
        }
    }

    private collectItem(item: string): void {
        this.gameState.collectedItems.add(item);
        this.gameState.inventory.push(item);
        
        // 顯示收集物品的訊息
        const itemMessages: { [key: string]: string } = {
            '電子節拍': '🎵 你感受到電子音樂的節奏感，獲得了一個電子節拍！',
            '心靈旋律': '🎶 Yorushika 的音樂觸動了你的心靈，獲得了一個心靈旋律！',
            '浪漫音符': '🎭 法式音樂劇的優雅讓你著迷，獲得了一個浪漫音符！',
            '程式碼片段': '💻 你學會了新的程式設計技巧，獲得了一個程式碼片段！',
            '智慧結晶': '📚 你的知識邊界得到了擴展，獲得了一個智慧結晶！',
            '創意火花': '🎮 你的創意被激發了，獲得了一個創意火花！',
            '靈感之光': '✨ 你獲得了隱藏的靈感之光！這將幫助你在程式設計中更有創意！',
            '夢想之翼': '🦋 你獲得了終極獎勵：夢想之翼！這代表著無限的可能性和創意！\n🎉 恭喜你完成了整個冒險！你現在完全了解我了！'
        };
        
        const message = itemMessages[item] || `🎁 你獲得了：${item}`;
        this.addStoryLine(message);
        
        this.checkUnlockedSecrets();
    }

    private checkUnlockedSecrets(): void {
        const itemCount = this.gameState.collectedItems.size;
        
        // 收集到 3 個物品解鎖隱藏選項
        if (itemCount >= 3 && !this.gameState.unlockedSecrets.has('hidden_scene')) {
            this.gameState.unlockedSecrets.add('hidden_scene');
            setTimeout(() => {
                this.addStoryLine('🔓 恭喜！你收集到了足夠的物品，解鎖了隱藏選項！');
            }, 100);
        }
        
        // 收集到 6 個物品解鎖終極選項
        if (itemCount >= 6 && !this.gameState.unlockedSecrets.has('ultimate_scene')) {
            this.gameState.unlockedSecrets.add('ultimate_scene');
            setTimeout(() => {
                this.addStoryLine('🌟 太棒了！你收集到了所有物品，解鎖了終極隱藏選項！');
            }, 200);
        }
    }

    private goToScene(sceneId: string): void {
        const scene = this.scenes.get(sceneId);
        if (!scene) {
            this.addStoryLine('錯誤：找不到該場景。');
            return;
        }

        // 如果不是返回操作，記錄歷史
        if (this.gameState.currentScene !== sceneId) {
            this.gameState.sceneHistory.push(this.gameState.currentScene);
        }

        this.gameState.currentScene = sceneId;
        this.gameState.visitedScenes.add(sceneId);
        
        this.updateNavigationButtons();
        this.displayScene(scene);
    }

    private goBack(): void {
        if (this.gameState.sceneHistory.length > 0) {
            const previousScene = this.gameState.sceneHistory.pop()!;
            this.gameState.currentScene = previousScene;
            this.updateNavigationButtons();
            this.displayScene(this.scenes.get(previousScene)!);
        }
    }

    private updateNavigationButtons(): void {
        // 更新返回按鈕狀態
        this.backBtn.disabled = this.gameState.sceneHistory.length === 0;
        
        // 更新 home 按鈕狀態（如果不是在主選單就啟用）
        this.homeBtn.disabled = this.gameState.currentScene === 'start';
    }

    private displayScene(scene: Scene): void {
        this.clearDisplay();
        
        this.addStoryLine(`=== ${scene.title} ===`, 'section-title');
        this.addStoryLine(scene.description);
        
        if (scene.onEnter) {
            scene.onEnter();
        }
        
        this.displayChoices(scene.choices);
    }

    private displayChoices(choices: Choice[]): void {
        this.choicesContainer.innerHTML = '';
        
        let visibleIndex = 1;
        choices.forEach((choice, index) => {
            if (choice.condition && !choice.condition()) {
                return;
            }
            
            const choiceElement = document.createElement('button');
            choiceElement.className = 'choice';
            choiceElement.textContent = `${visibleIndex}. ${choice.text}`;
            choiceElement.addEventListener('click', () => {
                choice.action();
            });
            
            this.choicesContainer.appendChild(choiceElement);
            visibleIndex++;
        });
    }

    private addStoryLine(text: string, className: string = ''): void {
        const line = document.createElement('div');
        line.className = `story-line ${className}`;
        // 將換行符轉換為 <br> 標籤
        line.innerHTML = text.replace(/\n/g, '<br>');
        this.storyDisplay.appendChild(line);
        
        // 自動滾動到底部
        this.storyDisplay.scrollTop = this.storyDisplay.scrollHeight;
    }

    private clearDisplay(): void {
        this.storyDisplay.innerHTML = '';
        this.choicesContainer.innerHTML = '';
    }

    private startGame(): void {
        this.addStoryLine('系統啟動中...', 'typing');
        setTimeout(() => {
            this.goToScene('start');
            this.updateNavigationButtons();
        }, 1000);
    }
}

// 啟動遊戲
document.addEventListener('DOMContentLoaded', () => {
    new TextAdventure();
});
