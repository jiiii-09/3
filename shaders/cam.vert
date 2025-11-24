attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    // 좌우 반전
    vTexCoord = vec2(1.0 - aTexCoord.x, aTexCoord.y);

    gl_Position = vec4(aPosition, 1.0);
}
