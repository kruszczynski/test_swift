public func asHex<S: Sequence>(_ x: S) -> String
  where S.Iterator.Element : Integer {
  return "[ " + x.lazy.map { asHex($0) }.joined(separator: ", ") + " ]"
}
