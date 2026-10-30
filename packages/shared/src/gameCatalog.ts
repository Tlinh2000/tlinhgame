export const CATEGORIES = ['Tất cả', 'Sinh tồn', 'Đua xe', 'Đối kháng', 'Thể thao', 'Trí tuệ'] as const;
export type Category = (typeof CATEGORIES)[number];
export interface GameDefinition {
  id: string;
  name: string;
  category: Exclude<Category, 'Tất cả'>;
  minPlayers: number;
  maxPlayers: number;
  summary: string;
  rules: string;
  controls: string;
  duration: string;
  artwork: 'ice' | 'kart' | 'lava' | 'sword' | 'ball' | 'chess';
  priority: 'first' | 'later';
  status: 'planned';
}

export const GAME_CATALOG: readonly GameDefinition[] = [
  { id: 'ice-arena', name: 'Ice Arena', category: 'Sinh tồn', minPlayers: 2, maxPlayers: 10, summary: 'Giữ thăng bằng. Chọn thời điểm. Trụ lại cuối cùng.', rules: 'Đẩy đối thủ rơi khỏi sàn băng. Người còn lại thắng; tối đa 120 giây. Nhiều người còn sống khi hết giờ hoặc những người cuối cùng rơi cùng bước mô phỏng thì hòa.', controls: 'WASD hoặc phím mũi tên để di chuyển, Space để đẩy. Điện thoại sẽ có cần điều khiển và nút đẩy.', duration: '2 phút', artwork: 'ice', priority: 'first', status: 'planned' },
  { id: 'kart-racing', name: 'Kart Racing', category: 'Đua xe', minPlayers: 2, maxPlayers: 10, summary: 'Từng khúc cua đều có thể thay đổi cuộc đua.', rules: 'Đua 3 vòng qua checkpoint đúng thứ tự. Xếp hạng theo lúc về đích; giới hạn 5 phút. Người chưa hoàn thành xếp theo tiến độ hợp lệ.', controls: 'WASD hoặc phím mũi tên để ga, phanh và lái. Điện thoại sẽ có điều khiển cảm ứng.', duration: '3 vòng', artwork: 'kart', priority: 'first', status: 'planned' },
  { id: 'moto-racing', name: 'Moto Racing', category: 'Đua xe', minPlayers: 2, maxPlayers: 8, summary: 'Tốc độ trên cung đường ven biển.', rules: 'Đua 3 vòng với nghiêng xe, ngã và checkpoint do máy chủ xác nhận.', controls: 'Ga, phanh và lái bằng bàn phím hoặc cảm ứng.', duration: '3 vòng', artwork: 'kart', priority: 'later', status: 'planned' },
  { id: 'offroad-racing', name: 'Offroad Racing', category: 'Đua xe', minPlayers: 2, maxPlayers: 8, summary: 'Chinh phục đường đất và địa hình hiểm trở.', rules: 'Đi qua các cổng đến đích. Phục hồi sau khi lật xe chịu phạt thời gian.', controls: 'Ga, phanh, lái và phục hồi xe.', duration: 'Theo đường đua', artwork: 'kart', priority: 'later', status: 'planned' },
  { id: 'obstacle-battle', name: 'Obstacle Battle', category: 'Sinh tồn', minPlayers: 2, maxPlayers: 10, summary: 'Vượt bẫy và chạm đích trước đối thủ.', rules: 'Vượt vật cản; khi ngã hồi sinh ở checkpoint hợp lệ. Xếp hạng theo thời gian hoặc tiến độ.', controls: 'Di chuyển và nhảy.', duration: 'Theo bản đồ', artwork: 'ice', priority: 'later', status: 'planned' },
  { id: 'floor-is-lava', name: 'The Floor Is Lava', category: 'Sinh tồn', minPlayers: 2, maxPlayers: 10, summary: 'Chỉ một bước hụt cũng đủ kết thúc.', rules: 'Nhảy giữa các bục, tránh dung nham. Người sống cuối thắng; còn nhiều người khi hết giờ thì hòa.', controls: 'Di chuyển và nhảy.', duration: 'Theo vòng', artwork: 'lava', priority: 'later', status: 'planned' },
  { id: 'sword-duel', name: 'Sword Duel', category: 'Đối kháng', minPlayers: 2, maxPlayers: 2, summary: 'Bình tĩnh, đỡ đòn và phản công.', rules: 'Thắng 2 trong 3 hiệp. Hết giờ so lượng máu, bằng máu hòa hiệp.', controls: 'Di chuyển, đánh, đỡ và né theo hồi chiêu.', duration: '3 hiệp', artwork: 'sword', priority: 'later', status: 'planned' },
  { id: 'arena-battle', name: 'Arena Battle', category: 'Đối kháng', minPlayers: 2, maxPlayers: 10, summary: 'Bước vào đấu trường và tạo dấu ấn.', rules: 'Đấu tự do 5 phút. So số hạ gục, tiếp theo ít lần bị hạ hơn, vẫn bằng thì hòa.', controls: 'Di chuyển, đánh và né.', duration: '5 phút', artwork: 'sword', priority: 'later', status: 'planned' },
  { id: 'penalty-king', name: 'Penalty King', category: 'Thể thao', minPlayers: 2, maxPlayers: 2, summary: 'Một cú sút. Một cơ hội.', rules: 'Đổi vai sút và bắt bóng, 5 lượt mỗi người. Hòa thì sút luân lưu từng cặp.', controls: 'Chọn hướng, lực sút hoặc hướng đổ người.', duration: '5 lượt mỗi bên', artwork: 'ball', priority: 'later', status: 'planned' },
  { id: 'street-basketball', name: 'Street Basketball', category: 'Thể thao', minPlayers: 2, maxPlayers: 2, summary: 'Làm chủ sân bóng đường phố.', rules: 'Đến 11 điểm hoặc hết 3 phút. Bằng điểm thì lượt ghi điểm tiếp theo thắng.', controls: 'Di chuyển, dẫn bóng, ném và chắn.', duration: '3 phút', artwork: 'ball', priority: 'later', status: 'planned' },
  { id: 'mini-golf', name: 'Mini Golf', category: 'Thể thao', minPlayers: 2, maxPlayers: 6, summary: 'Tính góc, chọn lực và đưa bóng vào hố.', rules: '3 hố, tối đa 8 gậy mỗi hố. Tổng gậy thấp hơn thắng; bằng thì hòa.', controls: 'Kéo để chọn hướng và lực.', duration: '3 hố', artwork: 'ball', priority: 'later', status: 'planned' },
  { id: 'chess-battle', name: 'Chess Battle', category: 'Trí tuệ', minPlayers: 2, maxPlayers: 2, summary: 'Mỗi nước đi mở ra một thế trận.', rules: 'Cờ vua đúng luật với đồng hồ 5 phút mỗi bên; xử lý chiếu hết, hết giờ, xin thua và hòa.', controls: 'Chạm hoặc kéo quân cờ.', duration: '5 phút mỗi bên', artwork: 'chess', priority: 'later', status: 'planned' },
  { id: 'quiz-arena', name: 'Quiz Arena', category: 'Trí tuệ', minPlayers: 2, maxPlayers: 10, summary: 'Cùng tranh tài qua những câu hỏi kiến thức.', rules: '10 câu, 15 giây mỗi câu. Đúng được 100 điểm; bằng điểm thì hòa. Đáp án chỉ công bố sau khi khóa lượt.', controls: 'Chạm để chọn đáp án.', duration: '10 câu', artwork: 'chess', priority: 'later', status: 'planned' },
];
