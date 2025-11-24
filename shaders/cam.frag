precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D u_tex0;

vec3 palette(float t) {
    vec3 c1 = vec3(0.10, 0.00, 0.30); // 진보라 (#1A004D)
    vec3 c2 = vec3(0.48, 0.16, 0.65);
    vec3 c3 = vec3(1.00, 0.43, 0.00);
    vec3 c4 = vec3(1.00, 0.91, 0.00);
    vec3 c5 = vec3(1.00, 1.00, 1.00);

    if (t < 0.25) return mix(c1, c2, t / 0.25);
    if (t < 0.50) return mix(c2, c3, (t - 0.25) / 0.25);
    if (t < 0.75) return mix(c3, c4, (t - 0.50) / 0.25);
    return mix(c4, c5, (t - 0.75) / 0.25);
}

void main() {
    vec3 col = texture2D(u_tex0, vTexCoord).rgb;
    float brightness = dot(col, vec3(0.2126, 0.7152, 0.0722));

    gl_FragColor = vec4(palette(brightness), 1.0);
}
