const LOCAL_PLAYER_ID = getLocalPlayerUniqueID();  //获取本地玩家ID
const GROUND_MOTION_Y = -0.07840000092983246; //用于判定落地的移动值
const JUMP_STRENGTH = 0.41999998688697815; //落地之后的跳跃高度(第一tick中y移动值)
const AIR_RESISTANCE = 0.91; //空中的阻力系数
const AIR_SPEED = 0.05; //空中的移动速度
const GROUND_RESISTANCE = 0.6; //地面的阻力系数
const GROUND_SPEED = 0.1; //地面移动速度
const ERROR = 1.0e-7; //允许的容错,预测值和实际数值相差低于该值则不改动移动值
const SPEED = 0.95; //移动速度

/*
  除SPEED和JUMP_STRENGTH之外任何常量不应该被改动
*/

const setPos = p => setEntityPos(LOCAL_PLAYER_ID, p.x, p.y, p.z); //设置实体坐标函数
const setMotion = m => setEntityMotion(LOCAL_PLAYER_ID, m.x, m.y, m.z); //设置实体动作函数
const getPos = () => getEntityPos(LOCAL_PLAYER_ID); //获取实体坐标函数
const getMotion = () => getEntityMotion(LOCAL_PLAYER_ID); //获取实体动作函数

let switch_ = false; //是否开启Bhop移动
let onGround = true; //当前是否在地面上
let resistance = GROUND_RESISTANCE; // 阻力系数
let speed = GROUND_SPEED; //移动速度
let motion = getMotion();

function onTickEvent() {
    if (!switch_) {  // 如果未开启Bhop，返回
        motion = getMotion(); 
        if (motion.y == GROUND_MOTION_Y) {
            speed = GROUND_SPEED; //在地面上时，速度为地面速度
            resistance = GROUND_RESISTANCE; //在地面上时，阻力为地面阻力
            onGround = true;
        } else {
            speed = AIR_SPEED; //在空中时，速度为空中速度
            resistance = AIR_RESISTANCE; //在空中时，阻力为空中阻力
            onGround = false;
        }
        return;
    }
    const current = getMotion();
    const offset = {
        y: current.y
    };
    let isMove = false;
    if (!current.x) offset.x = 0;
    else if (current.x > -ERROR && current.x < ERROR) offset.x = current.x;
    else {
        offset.x = (current.x / resistance - motion.x) * SPEED / speed;
        isMove = true;
    }

    if (!current.z) offset.z = 0;
    else if (current.z > -ERROR && current.z < ERROR) offset.z = current.z;
    else {
        offset.z = (current.z / resistance - motion.z) * SPEED / speed;
        isMove = true;
    }

    if (motion.y == GROUND_MOTION_Y) {
        if (isMove) offset.y = JUMP_STRENGTH; //在地面处启动跳跃
        offset.x = motion.x; //不改变x轴移动（保证水平方向不变）
        offset.z = motion.z; //不改变z轴移动（保证水平方向不变）
        speed = GROUND_SPEED;
        resistance = GROUND_RESISTANCE;
        onGround = true;
    } else {
        speed = AIR_SPEED;
        resistance = AIR_RESISTANCE;
        onGround = false;
    }
    motion = offset;
    setMotion(offset);
}

function onExecuteCommandEvent(message) { // 执行命令
    if (message == '/bhop exit') { // 退出脚本
        switch_ = false;
        clientMessage('§l§d[InfiniteAuraRIP] §ebhop Disabled');
        return true;
    } else if (message == '/bhop') { //切换Bhop状态
        switch_ = !switch_;
        if (switch_) {
            clientMessage('§l§d[InfiniteAuraRIP]§r§8>>>§r§e Bhop §a 已启用')
            } else
        clientMessage('§l§d[InfiniteAuraRIP]§r§8>>>§r§e Bhop §c 已禁用');
        return true;
    }
}

function onCallModuleEvent(args) { // 调用模块时执行
    if (args.fun === 'fun_move_jump') { // 切换Bhop状态
        switch_ = !switch_;
        clientMessage('§l§d [InfiniteAura] §ebhop: ' + switch_);
    }
}


clientMessage('§l§d [InfiniteAuraRIP] §eBhop Load Successful!\n退出Bhop脚本请 /bhop exit'); // 脚本加载提示消息