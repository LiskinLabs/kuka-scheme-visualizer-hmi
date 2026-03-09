function test() {
    let dx = -100;
    let x = 50;
    let finalX = x;
    if (dx < 0) finalX = x + dx;
    console.log("finalX:", finalX);
}
test();
