export default abstract class RedrawableBlockRenderComponent {
    public abstract build(): Promise<void>;
    public abstract redraw(): Promise<void>;
}
