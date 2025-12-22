function About() {
  return (
    <section id="about" className="py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          关于臭鱼烂虾杯
        </h2>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#1E90FF] to-[#00CED1] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">相信自己，创造奇迹</h3>
                <p className="text-white/90">
                  我们相信每一位玩家都有创造奇迹的潜力。臭鱼烂虾杯不仅是一个比赛平台，更是一个让玩家展示自我、挑战极限的舞台。无论你是新手还是老手，这里都欢迎你的加入！
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-[#FFA500] to-[#FFD700] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">丰富奖励</h3>
                <p className="text-white/90">
                 每一届主办方都会自掏腰包给参与者们一点小礼品！赞助商位招租...
                </p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">我们的使命</h3>
              <p className="text-gray-700 leading-relaxed">
                让更多的人参与到游戏活动当中来，交朋友，玩游戏，享受快乐才是最重要的！
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
